# Etap 2 — Szkielet mikroserwisu (FastAPI) — Windows 10, lokalnie

> **Cel etapu:** Utworzyć minimalnie działający mikroserwis AI w Python/FastAPI, zgodnie z PRD, z:
> 1) **Endpointem zdrowia** `GET /health`,
> 2) **Modułem QdrantClient** (inicjalizacja kolekcji, upsert/delete/search szkielety),
> 3) **Modułem Embeddings** (ładowanie lokalnego modelu `sentence-transformers`, funkcja `embed_text`),
> 4) **Funkcją budowy tekstu ofertowego** do embeddingu,
> 5) **Loggerem i obsługą wyjątków**.
>
> Po zakończeniu: kontener `ai-service` startuje FastAPI przez `uvicorn`, `/health` zwraca status OK z krótką diagnostyką (połączenie z Qdrant + test embedowania) i działa w `http://localhost:8000`.
>
> **Zgodność z PRD/szkieletem**: PRD wymaga mikroserwisu rekomendacyjnego z wyszukiwaniem semantycznym (Qdrant) i embeddingami lokalnymi. Ten etap tworzy stabilny fundament do dalszych etapów (indeksacja i zapytania).

---

## 2.0. Wymagania wstępne
- Wykonany **Etap 1** (Compose + Dockerfile) — masz usługę `qdrant` i `ai-service` przygotowane w `C:\dev\weddingapp`.
- Zmienna `OPENAI_API_KEY` w `ai-service\.env` (z Etapu 0) — nie będziemy jej jeszcze używać, ale pozostaje w środowisku.
- `QDRANT_URL` w `ai-service\.env` ustawione na `http://qdrant:6333` (dla sieci Compose).

---

## 2.1. Uzupełnienie zależności (embeddingi)
Korzystamy z pełnego `requirements.txt` z Etapu 1 (z `sentence-transformers`). Jeśli potrzebujesz dopisać ręcznie:

```powershell
Set-Location C:\dev\weddingapp\ai-service
Add-Content ".\requirements.txt" "sentence-transformers>=2.2,<3.0"
```

**Uwaga:** Pakiet doinstaluje zależności (m.in. `torch`). Przy pierwszym użyciu model zostanie pobrany z Hugging Face (internet wymagany).

---

## 2.2. Struktura katalogów mikroserwisu

Utwórz strukturę (moduły Pythona w folderze `app`):

```powershell
Set-Location C:\dev\weddingapp\ai-service
New-Item -ItemType Directory -Force -Path ".\app" | Out-Null
New-Item -ItemType File -Force -Path ".\app\__init__.py" | Out-Null
New-Item -ItemType File -Force -Path ".\app\main.py" | Out-Null
New-Item -ItemType File -Force -Path ".\app\config.py" | Out-Null
New-Item -ItemType File -Force -Path ".\app\logger.py" | Out-Null
New-Item -ItemType File -Force -Path ".\app\errors.py" | Out-Null
New-Item -ItemType File -Force -Path ".\app\embeddings.py" | Out-Null
New-Item -ItemType File -Force -Path ".\app\qdrant_client.py" | Out-Null
New-Item -ItemType File -Force -Path ".\app\domain.py" | Out-Null
```

---

## 2.3. Plik `app/config.py` — konfiguracja przez zmienne środowiskowe

```python
# app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # Klucze/sekrety
    OPENAI_API_KEY: str | None = Field(default=None)
    INTERNAL_TOKEN: str = Field(default="dev-internal-token-CHANGE_ME")

    # Qdrant
    QDRANT_URL: str = Field(default="http://qdrant:6333")
    QDRANT_COLLECTION: str = Field(default="wedding_listings_v1")

    # Embeddings
    EMBEDDING_MODEL: str = Field(default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
    VECTOR_SIZE: int = Field(default=384)  # MiniLM-L12-v2 => 384
    EMBEDDING_BATCH: int = Field(default=32)

    # Aplikacja
    APP_HOST: str = Field(default="0.0.0.0")
    APP_PORT: int = Field(default=8000)
    DEBUG: bool = Field(default=True)

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
```

> Wartości zgodne z PRD/szkieletem: lokalne embeddingi (MiniLM), Qdrant jako wektorowe storage, kolekcja `wedding_listings_v1`.

---

## 2.4. Plik `app/logger.py` — logger

```python
# app/logger.py
import logging
import sys

def setup_logger(name: str = "ai-service", level: int = logging.INFO) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(level)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        fmt = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
        handler.setFormatter(logging.Formatter(fmt))
        logger.addHandler(handler)

    # Zmniejsz gadatliwość bibliotek zewnętrznych
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("qdrant_client").setLevel(logging.WARNING)

    return logger

logger = setup_logger()
```

---

## 2.5. Plik `app/errors.py` — globalny handler wyjątków

```python
# app/errors.py
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR
from app.logger import logger

class AppError(Exception):
    def __init__(self, message: str, status_code: int = HTTP_500_INTERNAL_SERVER_ERROR):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

async def app_error_handler(request: Request, exc: AppError):
    logger.error(f"[AppError] {exc.message}")
    return JSONResponse(status_code=exc.status_code, content={"error": exc.message})

async def unhandled_error_handler(request: Request, exc: Exception):
    logger.exception("[UnhandledError]", exc_info=exc)
    return JSONResponse(status_code=HTTP_500_INTERNAL_SERVER_ERROR, content={"error": "Internal server error"})
```

---

## 2.6. Plik `app/embeddings.py` — ładowanie modelu i `embed_text`

```python
# app/embeddings.py
from functools import lru_cache
from sentence_transformers import SentenceTransformer
from app.config import settings
from app.logger import logger

@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
    model = SentenceTransformer(settings.EMBEDDING_MODEL)
    return model

def embed_text(text: str) -> list[float]:
    model = get_model()
    vec = model.encode([text], normalize_embeddings=True)[0].tolist()
    if len(vec) != settings.VECTOR_SIZE:
        logger.warning(f"VECTOR_SIZE mismatch: expected {settings.VECTOR_SIZE}, got {len(vec)}")
    return vec
```

> `normalize_embeddings=True` → kosinusowa odległość działa stabilniej (PRD zakłada COSINE w Qdrant).

---

## 2.7. Plik `app/domain.py` — budowanie tekstu ofertowego do embeddingu

```python
# app/domain.py
from typing import Any

def build_listing_text_for_embedding(listing: dict[str, Any]) -> str:
    """
    Skleja treść do embeddingu z atrybutów oferty.
    Oczekiwane pola: title, longDescription, category, city, priceMin, priceMax, features, rating (opcjonalnie).
    """
    title = listing.get("title") or ""
    desc = listing.get("longDescription") or ""
    cat = listing.get("category") or ""
    city = listing.get("city") or ""
    pmin = listing.get("priceMin")
    pmax = listing.get("priceMax")
    rating = listing.get("rating")
    features = listing.get("features")

    price_part = ""
    if pmin is not None or pmax is not None:
        price_part = f"Cena: {pmin or ''}-{pmax or ''} PLN."

    rating_part = f"Ocena: {rating}/5." if rating is not None else ""

    features_part = ""
    if isinstance(features, (list, tuple)):
        features_part = "Cechy: " + ", ".join(map(str, features)) + "."
    elif isinstance(features, str):
        features_part = f"Cechy: {features}."

    # Tekst wielojęzyczny, ale z akcentem PL (model multilingual)
    return (
        f"Tytuł: {title}. "
        f"Kategoria: {cat}. "
        f"Miasto: {city}. "
        f"{price_part} "
        f"{rating_part} "
        f"Opis: {desc}. "
        f"{features_part}"
    ).strip()
```

---

## 2.8. Plik `app/qdrant_client.py` — inicjalizacja kolekcji i szkielety metod

```python
# app/qdrant_client.py
from typing import Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, Filter, FieldCondition, MatchValue
from app.config import settings
from app.logger import logger

class QdrantService:
    def __init__(self, url: str, collection: str, vector_size: int):
        self.client = QdrantClient(url=url)
        self.collection = collection
        self.vector_size = vector_size

    def ensure_collection(self) -> None:
        try:
            self.client.get_collection(self.collection)
            logger.info(f"Qdrant collection exists: {self.collection}")
        except Exception:
            logger.info(f"Creating Qdrant collection: {self.collection}")
            self.client.recreate_collection(
                collection_name=self.collection,
                vectors_config=VectorParams(size=self.vector_size, distance=Distance.COSINE),
            )

    def upsert_point(self, point_id: int | str, vector: list[float], payload: dict[str, Any]) -> None:
        self.client.upsert(
            collection_name=self.collection,
            points=[
                {"id": point_id, "vector": vector, "payload": payload}
            ],
        )

    def delete_point(self, point_id: int | str) -> None:
        self.client.delete(
            collection_name=self.collection,
            points_selector={"points": [point_id]}
        )

    def build_filter(self, *, city: Optional[str] = None, category: Optional[str] = None,
                     price_min: Optional[int] = None, price_max: Optional[int] = None) -> Optional[Filter]:
        must = []
        if city:
            must.append(FieldCondition(key="city", match=MatchValue(value=city)))
        if category:
            must.append(FieldCondition(key="category", match=MatchValue(value=category)))
        # Budżet będzie doprecyzowany w Etapie 4/9 (przykładowo wg priceMin/priceMax)
        # Tu zostawiamy jako TODO lub bardzo prosty warunek w przyszłości.
        if not must:
            return None
        return Filter(must=must)

    def search(self, query_vector: list[float], *, limit: int = 10, qfilter: Optional[Filter] = None):
        return self.client.search(
            collection_name=self.collection,
            query_vector=query_vector,
            limit=limit,
            query_filter=qfilter
        )

# Singleton dla aplikacji
_qdrant_service: Optional[QdrantService] = None

def get_qdrant() -> QdrantService:
    global _qdrant_service
    if _qdrant_service is None:
        _qdrant_service = QdrantService(
            url=settings.QDRANT_URL,
            collection=settings.QDRANT_COLLECTION,
            vector_size=settings.VECTOR_SIZE,
        )
        _qdrant_service.ensure_collection()
    return _qdrant_service
```

> **Uwaga:** `recreate_collection` tworzy kolekcję od nowa. Tu użyty w prostym flow; później, przy migracjach/wersjonowaniu, możesz zarządzać nazwą kolekcji (`..._v2`).

---

## 2.9. Plik `app/main.py` — aplikacja FastAPI + `/health`

```python
# app/main.py
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from starlette.status import HTTP_200_OK
from app.config import settings
from app.logger import logger
from app.errors import AppError, app_error_handler, unhandled_error_handler
from app.embeddings import embed_text
from app.qdrant_client import get_qdrant

app = FastAPI(title="WeddingApp AI Service", version="0.1.0")

# Rejestracja handlerów błędów
app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(Exception, unhandled_error_handler)

@app.get("/health")
def health():
    """
    Minimalne samobadanie:
    - próba załadowania modelu embeddingów oraz osadzenia krótkiego tekstu,
    - sprawdzenie dostępności kolekcji w Qdrant.
    """
    # Test embeddingu
    vec = embed_text("healthcheck")
    # Test Qdrant
    qdr = get_qdrant()
    # Nie wykonujemy search, wystarczy ensure_collection w getterze

    return JSONResponse(
        status_code=HTTP_200_OK,
        content={
            "status": "ok",
            "vector_len": len(vec),
            "qdrant_collection": settings.QDRANT_COLLECTION,
            "embedding_model": settings.EMBEDDING_MODEL,
        },
    )
```

---

## 2.10. Zmiana `Dockerfile` — uruchamianie FastAPI

Zastąp `CMD ["sh","-c","sleep infinity"]` komendą `uvicorn`:

```powershell
Set-Location C:\dev\weddingapp\ai-service
(Get-Content .\Dockerfile) -replace 'CMD \["sh", "-c", "sleep infinity"\]', 'CMD ["uvicorn","app.main:app","--host","0.0.0.0","--port","8000"]' | Set-Content .\Dockerfile -Encoding UTF8
```

---

## 2.11. Healthcheck dla `ai-service` w Compose

Dodaj healthcheck do `ai-service` (w `docker-compose.yml`), aby Docker monitorował stan aplikacji:

```yaml
# fragment docker-compose.yml (usługa ai-service)
  ai-service:
    ...
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 5
```

Po edycji zapisz plik.

---

## 2.12. Build i uruchomienie — Windows PowerShell

### 2.12.1. Zbuduj obraz `ai-service`
```powershell
Set-Location C:\dev\weddingapp
docker compose build ai-service
```

> Pierwszy build może być długi (instalacja zależności).

### 2.12.2. Uruchom usługi
```powershell
docker compose up -d
docker compose ps
```

### 2.12.3. Sprawdź `/health`
- PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing
```
- lub `curl`:
```powershell
curl http://localhost:8000/health
```

**Oczekiwany wynik (JSON)** — przykładowo:
```json
{
  "status": "ok",
  "vector_len": 384,
  "qdrant_collection": "wedding_listings_v1",
  "embedding_model": "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
}
```

> Przy pierwszym wywołaniu `/health` model embeddingów może zostać **pobrany** do cache wewnątrz kontenera (zajmuje to chwilę).

---

## 2.13. Debug i typowe problemy

- **Model długo się ładuje / błąd pobierania**: Upewnij się, że kontener ma dostęp do Internetu; sprawdź logi `docker logs wedding-ai-service`.
- **`VECTOR_SIZE mismatch`** w logu: Zaktualizuj `settings.VECTOR_SIZE` tak, by odpowiadał wybranemu modelowi.
- **Qdrant niedostępny**: sprawdź `QDRANT_URL` w `.env` (powinno być `http://qdrant:6333` gdy w Compose), oraz zdrowie Qdrant `http://localhost:6333/healthz`.
- **Błąd importu paczek**: upewnij się, że `requirements.txt` zawiera wszystkie biblioteki i obraz został przebudowany `docker compose build ai-service`.

---

## 2.14. Lista kontrolna (odhacz przed Etapem 3)
- [ ] `ai-service` startuje i serwuje `GET /health` na `http://localhost:8000/health`.
- [ ] `/health` zwraca `status=ok`, `vector_len` == `VECTOR_SIZE`, prawidłową nazwę kolekcji i modelu.
- [ ] Logi zawierają informację o załadowaniu modelu embeddingów i istnieniu kolekcji Qdrant.
- [ ] `docker compose ps` pokazuje `qdrant` i `ai-service` jako uruchomione (healthy, jeśli dodałeś healthcheck).

---

## 2.15. Co dalej (most do Etapu 3)
- W Etapie 3 dodasz endpointy indeksacji:
  - `POST /recommendation/updateEmbedding` (create/update punktów w Qdrant),
  - `DELETE /recommendation/removeEmbedding/:listingId`,
  - (opcjonalnie) `POST /recommendation/reindexAll`.
- Użyjesz funkcji `build_listing_text_for_embedding()` + `embed_text()` i metod z `QdrantService`.
- Docelowo dodasz pobieranie danych oferty z backendu Node/MySQL (lub bezpośrednio z DB).
