# Etap 3 — Indeksowanie ofert (Qdrant + Embeddingi) — Windows 10, lokalnie

> **Cel etapu:** Zaimplementować w mikroserwisie AI komplet endpointów do zarządzania indeksem wektorowym ofert:
>
> - `POST /recommendation/updateEmbedding` — stworzenie/aktualizacja punktu w Qdrant na podstawie `listingId` **albo** pełnego payloadu oferty,
> - `DELETE /recommendation/removeEmbedding/{listingId}` — usunięcie punktu,
> - **(opcjonalnie)** `POST /recommendation/reindexAll` — pełna przebudowa indeksu z bazy.
>
> **Zgodność z PRD/szkieletem:** PRD wymaga aktualizacji wektorów przy dodaniu/edycji/usunięciu oferty oraz możliwości pełnej przebudowy indeksu. Endpointy te będą wywoływane **z backendu Node** (wewnętrznie), zabezpieczone nagłówkiem `X-Internal-Token`.

---

## 3.0. Wymagania wstępne
- Wykonany **Etap 2** — masz folder `C:\dev\weddingapp\ai-service\app\` z plikami `main.py`, `qdrant_client.py`, `embeddings.py`, `domain.py`, `config.py`, `logger.py`, `errors.py`.
- Działające kontenery z Etapu 1: `qdrant` i `ai-service` (`docker compose up -d`).
- Backend Node działa lokalnie (lub w Compose), korzysta z lokalnego MySQL (poza Compose).
- W pliku `.env` w `ai-service` masz co najmniej: `QDRANT_URL`, `EMBEDDING_MODEL`, `INTERNAL_TOKEN`.

---

## 3.1. Zależności (jedyny wariant: backend Node przez HTTP)
Zgodnie z PRD i ustaleniami – indeksujemy na podstawie danych z backendu Node (HTTP). Upewnij się, że `httpx` jest w `requirements.txt` (dodaliśmy w Etapie 1). Nie dodajemy sterowników MySQL do mikroserwisu.

---

## 3.2. Zmienne środowiskowe dla źródła danych (backend Node)
Dodaj do `C:\dev\weddingapp\ai-service\.env` (edytor lub komendy poniżej):

```powershell
Set-Location C:\dev\weddingapp\ai-service
Add-Content ".env" "DATA_SOURCE=backend"           # jedyny wariant
Add-Content ".env" "BACKEND_BASE_URL=http://host.docker.internal:3000"  # backend Node na hoście Windows
```

Uzupełnij `app/config.py` o pola:
```python
    # Źródło danych
    DATA_SOURCE: str = Field(default="backend")
    BACKEND_BASE_URL: str = Field(default="http://host.docker.internal:3000")
```

---

## 3.3. Middleware/autoryzacja: `X-Internal-Token`
Te endpointy mają być wywoływane **tylko z backendu**. Dodamy prostą weryfikację nagłówka.

Utwórz plik `app/auth.py`:
```powershell
Set-Location C:\dev\weddingapp\ai-service
New-Item -ItemType File -Force -Path ".\app\auth.py" | Out-Null
```

Wklej treść:
```python
# app/auth.py
from fastapi import Header, HTTPException, status
from app.config import settings

async def verify_internal_token(x_internal_token: str | None = Header(default=None)) -> None:
    if not x_internal_token or x_internal_token != settings.INTERNAL_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized (internal token invalid)"
        )
```

---

## 3.4. Schematy żądań/odpowiedzi (Pydantic)
Utwórz `app/schemas.py`:
```powershell
New-Item -ItemType File -Force -Path ".\app\schemas.py" | Out-Null
```

Wklej treść:
```python
# app/schemas.py
from typing import Any, Optional
from pydantic import BaseModel, Field

class ListingPayload(BaseModel):
    id: int
    title: str
    longDescription: Optional[str] = None
    category: str
    city: str
    priceMin: Optional[int] = None
    priceMax: Optional[int] = None
    rating: Optional[float] = None
    features: Optional[list[str] | str] = None
    url: Optional[str] = None  # link do oferty (otwierany w nowej karcie przez frontend)

class UpdateEmbeddingRequest(BaseModel):
    listingId: Optional[int] = Field(default=None, description="ID oferty do pobrania ze źródła danych")
    listing: Optional[ListingPayload] = Field(default=None, description="Pełny payload oferty (gdy nie chcesz pobierać)")

class UpdateEmbeddingResponse(BaseModel):
    updated: bool
    id: int
    vector_len: int
    payload_keys: list[str]

class RemoveEmbeddingResponse(BaseModel):
    removed: bool
    id: int

class ReindexAllRequest(BaseModel):
    limit: Optional[int] = Field(default=None, description="Ogranicz reindeks do N ofert (do testów)")
    batch: int = Field(default=64, description="Wielkość batcha do embedowania")

class ReindexAllResponse(BaseModel):
    indexed: int
    skipped: int
```

---

## 3.5. Dostęp do danych: backend (httpx)

Utwórz `app/data_access.py`:
```powershell
Set-Location C:\dev\weddingapp\ai-service
New-Item -ItemType File -Force -Path ".\app\data_access.py" | Out-Null
```

Wklej treść:
```python
# app/data_access.py
from __future__ import annotations
from typing import Any, Iterable
import httpx
from app.config import settings
from app.logger import logger

def _parse_features(raw: Any) -> list[str] | str | None:
    return raw  # backend powinien zwrócić już właściwy typ

class DataAccess:
    def __init__(self) -> None:
        self.source = settings.DATA_SOURCE

    # --- BACKEND (Node) ---
    async def get_listing_by_id_backend(self, listing_id: int) -> dict[str, Any]:
        url = f"{settings.BACKEND_BASE_URL}/api/listings/{listing_id}"
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(url)
            r.raise_for_status()
            data = r.json()
            return data

    async def get_all_listings_backend(self) -> Iterable[dict[str, Any]]:
        # Przykładowo stronicowanie; dopasuj do swojego backendu
        page = 1
        page_size = 500
        async with httpx.AsyncClient(timeout=30.0) as client:
            while True:
                url = f"{settings.BACKEND_BASE_URL}/api/listings?page={page}&limit={page_size}"
                r = await client.get(url)
                r.raise_for_status()
                items = r.json()
                if not items:
                    break
                for it in items:
                    yield it
                page += 1

    # --- API publiczne klasy ---
    async def get_listing_by_id(self, listing_id: int) -> dict[str, Any] | None:
        return await self.get_listing_by_id_backend(listing_id)

    async def iter_all_listings(self) -> Iterable[dict[str, Any]]:
        async for it in self.get_all_listings_backend():
            yield it
```

---

## 3.6. Szybkie batchowe embedowanie (utility)
Dopisujemy wersję batch do `app/embeddings.py`.

Otwórz `app/embeddings.py` i **dodaj** na końcu pliku:
```python
def embed_texts(texts: list[str]) -> list[list[float]]:
    model = get_model()
    vecs = model.encode(texts, normalize_embeddings=True)
    return [v.tolist() for v in vecs]
```

Zapisz plik.

---

## 3.7. Endpointy: update/remove/reindex
Edytuj `app/main.py` — dodamy router „recommendation”.

### 3.7.1. Dodaj importy (na górze `main.py`)
```python
from fastapi import Depends, Path
from app.auth import verify_internal_token
from app.schemas import (
    ListingPayload, UpdateEmbeddingRequest, UpdateEmbeddingResponse,
    RemoveEmbeddingResponse, ReindexAllRequest, ReindexAllResponse
)
from app.domain import build_listing_text_for_embedding
from app.data_access import DataAccess
from app.embeddings import embed_texts, embed_text
```

### 3.7.2. `POST /recommendation/updateEmbedding`
Dodaj do `main.py`:
```python
@app.post("/recommendation/updateEmbedding", response_model=UpdateEmbeddingResponse, dependencies=[Depends(verify_internal_token)])
async def update_embedding(req: UpdateEmbeddingRequest):
    if not req.listingId and not req.listing:
        raise AppError("Provide listingId or listing payload")

    data_source = DataAccess()
    if req.listing is not None:
        listing = req.listing.model_dump()
    else:
        listing = await data_source.get_listing_by_id(int(req.listingId))  # may raise if 404 from backend
        if listing is None:
            raise AppError(f"Listing id={req.listingId} not found", status_code=404)

    # Zbuduj tekst i wektor
    text = build_listing_text_for_embedding(listing)
    vec = embed_text(text)

    # Payload do Qdrant
    payload = {
        "id": listing["id"],
        "title": listing.get("title"),
        "category": listing.get("category"),
        "city": listing.get("city"),
        "priceMin": listing.get("priceMin"),
        "priceMax": listing.get("priceMax"),
        "rating": listing.get("rating"),
        "features": listing.get("features"),
        "url": listing.get("url"),
        "vendorId": listing.get("vendorId"),  # dla różnorodności w Etapie 9
        "reviewsCount": listing.get("reviewsCount"),  # dla rankingu w Etapie 9
        "offersNationwideService": listing.get("offersNationwideService", False),  # dla filtrów geograficznych
    }

    qdr = get_qdrant()
    qdr.upsert_point(point_id=listing["id"], vector=vec, payload=payload)

    return UpdateEmbeddingResponse(
        updated=True,
        id=listing["id"],
        vector_len=len(vec),
        payload_keys=sorted(list(payload.keys())),
    )
```

### 3.7.3. `DELETE /recommendation/removeEmbedding/{listingId}`
Dodaj do `main.py`:
```python
@app.delete("/recommendation/removeEmbedding/{listingId}", response_model=RemoveEmbeddingResponse, dependencies=[Depends(verify_internal_token)])
async def remove_embedding(listingId: int = Path(..., description="ID oferty")):
    qdr = get_qdrant()
    qdr.delete_point(point_id=listingId)
    return RemoveEmbeddingResponse(removed=True, id=listingId)
```

### 3.7.4. **(opcjonalnie)** `POST /recommendation/reindexAll`
Dodaj do `main.py`:
```python
@app.post("/recommendation/reindexAll", response_model=ReindexAllResponse, dependencies=[Depends(verify_internal_token)])
async def reindex_all(req: ReindexAllRequest):
    data_source = DataAccess()

    # Pobierz wszystkie oferty (iteracyjnie)
    items = []
    count = 0
    async for it in data_source.iter_all_listings():
        items.append(it)
        count += 1
        if req.limit and count >= req.limit:
            break

    if not items:
        return ReindexAllResponse(indexed=0, skipped=0)

    # Budowa tekstów i batchowe embedowanie
    texts = [build_listing_text_for_embedding(x) for x in items]
    vectors = []
    for i in range(0, len(texts), req.batch):
        batch_texts = texts[i:i+req.batch]
        batch_vectors = embed_texts(batch_texts)
        vectors.extend(batch_vectors)

    qdr = get_qdrant()
    indexed = 0
    skipped = 0
    for it, vec in zip(items, vectors):
        payload = {
            "id": it["id"],
            "title": it.get("title"),
            "category": it.get("category"),
            "city": it.get("city"),
            "priceMin": it.get("priceMin"),
            "priceMax": it.get("priceMax"),
            "rating": it.get("rating"),
            "features": it.get("features"),
            "url": it.get("url"),
            "vendorId": it.get("vendorId"),
            "reviewsCount": it.get("reviewsCount"),
            "offersNationwideService": it.get("offersNationwideService", False),
        }
        try:
            qdr.upsert_point(point_id=it["id"], vector=vec, payload=payload)
            indexed += 1
        except Exception:
            skipped += 1

    return ReindexAllResponse(indexed=indexed, skipped=skipped)
```

Zapisz `main.py`.

---

## 3.8. Build i uruchomienie (Docker)

```powershell
Set-Location C:\dev\weddingapp
docker compose build ai-service
docker compose up -d
docker compose ps
docker logs wedding-ai-service --tail=100
```

> Przy pierwszym reindeksie model może pobierać pliki; Qdrant tworzy kolekcję (z Etapu 2).

---

## 3.9. Testy API (PowerShell / curl)

### 3.9.1. Update pojedynczej oferty na podstawie ID
```powershell
# Załóżmy, że w bazie masz ofertę z id=1
$body = @{ listingId = 1 } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8000/recommendation/updateEmbedding" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{ "X-Internal-Token" = "dev-internal-token-CHANGE_ME" } `
  -Body $body
```

**Oczekiwany wynik (JSON):**
```json
{ "updated": true, "id": 1, "vector_len": 384, "payload_keys": ["category","city","features","id","priceMax","priceMin","rating","title","url"] }
```

### 3.9.2. Update na podstawie pełnego payloadu (bez pobierania)
```powershell
$payload = @{
  listing = @{
    id = 9999
    title = "Testowa oferta"
    longDescription = "Opis testowy do embeddingu"
    category = "Fotografia"
    city = "Kraków"
    priceMin = 1000
    priceMax = 3000
    rating = 4.7
    features = @("dron","album premium")
    url = "https://twoja-aplikacja/oferty/9999"
  }
} | ConvertTo-Json -Depth 5

Invoke-WebRequest -Uri "http://localhost:8000/recommendation/updateEmbedding" `
  -Method POST -ContentType "application/json" `
  -Headers @{ "X-Internal-Token" = "dev-internal-token-CHANGE_ME" } `
  -Body $payload
```

### 3.9.3. Usunięcie punktu
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/recommendation/removeEmbedding/9999" `
  -Method DELETE `
  -Headers @{ "X-Internal-Token" = "dev-internal-token-CHANGE_ME" }
```

### 3.9.4. Pełny reindex (ograniczony do 100 ofert, batch=64)
```powershell
$body = @{ limit = 100; batch = 64 } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8000/recommendation/reindexAll" `
  -Method POST -ContentType "application/json" `
  -Headers @{ "X-Internal-Token" = "dev-internal-token-CHANGE_ME" } `
  -Body $body
```

---

## 3.10. Walidacja w Qdrant (REST)
Możesz podejrzeć punkty w kolekcji przez Qdrant REST:

```powershell
# Scroll payloadów (przykładowo do 5 szt.)
curl -X POST http://localhost:6333/collections/wedding_listings_v1/points/scroll `
  -H "Content-Type: application/json" `
  -d '{ "limit": 5, "with_payload": true }'
```

> Jeśli zwracane są punkty z payloadem Twoich ofert — indeks działa.

---

## 3.11. Typowe problemy i ich szybkie rozwiązania
- **401 Unauthorized**: upewnij się, że wysyłasz nagłówek `X-Internal-Token` zgodny z `INTERNAL_TOKEN` w `.env` mikroserwisu.
- **404 podczas pobierania z backendu**: sprawdź, czy endpoint i `BACKEND_BASE_URL` są prawidłowe oraz czy oferta istnieje.
- **Wolne embedowanie**: to normalne przy pierwszym uruchomieniu (pobranie modelu). Na stałe cache zostaje w warstwie obrazu/kontenera.
- **Różny rozmiar wektora**: dopasuj `VECTOR_SIZE` w `config.py` do wybranego modelu (MiniLM-L12-v2 → 384).

---

## 3.12. Lista kontrolna (odhacz przed Etapem 4)
- [ ] `POST /recommendation/updateEmbedding` działa dla `listingId` oraz dla `listing` (payload) i zapisuje punkt w Qdrant.
- [ ] `DELETE /recommendation/removeEmbedding/{listingId}` usuwa punkt.
- [ ] `(Opcj.) POST /recommendation/reindexAll` indeksuje wiele ofert (z limitem i batchem).
- [ ] `X-Internal-Token` jest wymagany i poprawnie weryfikowany.
- [ ] Scroll w Qdrant REST pokazuje zapisane payloady ofert.

---

## 3.13. Co dalej (most do Etapu 4)
- W Etapie 4 zrobisz `POST /recommendation/query`: wydobędziesz kryteria (kategoria/miasto/budżet), wygenerujesz embedding pytania, zapytasz Qdrant z filtrami i zwrócisz „gołe” top N ofert (bez GPT).
- Przygotujesz też proste testy, by szybko sprawdzić trafność wyników przed dołożeniem warstwy GPT.
