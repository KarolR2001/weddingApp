# Etap 4 — Zapytanie rekomendacyjne (bez GPT, „gołe” wyniki) — Windows 10, lokalnie

> Cel: dodać endpoint `POST /recommendation/query`, który (1) wyciąga kryteria z tekstu (kategoria/miasto/budżet), (2) generuje embedding zapytania, (3) pyta Qdrant z filtrami, (4) zwraca listę top N ofert (bez GPT). Endpoint jest wywoływany z backendu Node i zabezpieczony `X-Internal-Token` — zgodnie z PRD.

---

## 4.0. Wymagania wstępne
- Wykonane Etapy 2–3 (FastAPI, indeksowanie, upsert/remove/reindex).
- Działające `qdrant` i `ai-service` (`docker compose up -d`).
- W `ai-service/.env`: `QDRANT_URL`, `EMBEDDING_MODEL`, `INTERNAL_TOKEN`.

---

## 4.1. Zakres i zgodność z PRD
Zgodnie z PRD dla tego etapu:
- Używamy lokalnych embeddingów (Sentence Transformers) — spójnie z indeksem w Qdrant.
- Wyszukiwanie semantyczne + filtry po metadanych (miasto/kategoria/budżet).
- Zwracamy surowe wyniki (oferty) — bez generowania odpowiedzi GPT (to Etap 5).

---

## 4.2. Struktury (lekkie, orientacyjne)
- Wejście (Pydantic):
```python
class QueryRequest(BaseModel):
    message: str
    sessionId: str | None = None
    limit: int = 10  # 1..50
```
- Wyjście (Pydantic):
```python
class OfferLite(BaseModel):
    id: int
    title: str
    city: str | None = None
    category: str | None = None
    priceMin: int | None = None
    priceMax: int | None = None
    url: str | None = None
    score: float
    snippet: str | None = None

class QueryResponse(BaseModel):
    offers: list[OfferLite]
    debug: dict | None = None
```
- Parser (heurystyki): funkcje `parse_category`, `parse_city`, `parse_budget(message) -> (min,max)` — zgodnie z opisem w PRD (proste wyrażenia dla fraz typu „fotograf”, „Warszawa”, „do 4000”).

---

## 4.3. Logika endpointu (opis kroków)
1) Ekstrakcja kryteriów
- Z `message` wyciągnij: `category`, `city`, `budget_min`, `budget_max` (prosty parser; listę miast rozszerzysz w Etapie 9).

2) Embedding zapytania
- `vector = embed_text(message)` (ten sam model co dla ofert; normalizacja on).

3) Filtr Qdrant (metadane)
- Zbuduj filtr:
  - `city == <city>` (jeśli jest) **LUB** `offersNationwideService == true` (zgodnie z PRD dla usług ogólnopolskich)
  - `category == <category>` (jeśli jest)
  - budżet (przecięcie widełek):
    - jeśli tylko `max`: `priceMin <= max`
    - jeśli tylko `min`: `priceMax >= min`
    - jeśli zakres: `priceMin <= max` oraz `priceMax >= min`

4) Wyszukiwanie w Qdrant
- `results = qdrant.search(vector, limit=limit, filter=...)` — zwróci punkty z `id`, `score`, `payload`.

5) Mapowanie na odpowiedź
- Dla każdego wyniku zbuduj `OfferLite` z `payload` (w tym `url` jeśli dostępny) oraz policz `snippet` (np. "Miasto • Cena ... • 2–3 cechy").
- Opcjonalnie `debug` (wykryte kryteria, zastosowany filtr, limit).

---

## 4.4. Minimalna sygnatura endpointu (FastAPI)
```python
@app.post("/recommendation/query", response_model=QueryResponse, dependencies=[Depends(verify_internal_token)])
def recommendation_query(req: QueryRequest):
    ... # kroki 1–5 powyżej
```

---

## 4.5. Testy manualne (PowerShell / curl)
- Fotograf Kraków do 4000 (limit 5):
```powershell
$body = @{ message = "Szukam fotograf Kraków do 4000"; limit = 5 } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8000/recommendation/query" `
  -Method POST -ContentType "application/json" `
  -Headers @{ "X-Internal-Token" = "dev-internal-token-CHANGE_ME" } `
  -Body $body
```
- DJ Warszawa 2500–3500 (limit 5): analogicznie.

Oczekiwane: JSON z `offers[]` (id, title, city, category, priceMin/Max, url, score, snippet) i `debug` (wykryte kryteria, filtr, limit).

---

## 4.6. Uwaga o jakości (zgodne z PRD)
- Parser to świadome uproszczenie — w Etapie 9 można podpiąć listę miast z DB i poprawić synonimy kategorii.
- Filtry budżetu stosują przecięcie widełek; w Etapie 9 dodamy re-ranking (np. preferencja po ratingu, miękkie traktowanie lekkiego przekroczenia budżetu).
- Brak GPT w tym etapie — to będzie w Etapie 5.

---

## 4.7. Lista kontrolna
- [ ] Endpoint `/recommendation/query` zwraca listę ofert z Qdrant dla prostych fraz ("DJ Warszawa do 3500").
- [ ] Ekstrakcja kategorii/miasta/budżetu działa dla popularnych przypadków.
- [ ] Filtr budżetu zawęża wyniki zgodnie z przecięciem widełek.
- [ ] Format odpowiedzi zgodny (offers + opcjonalny debug).

---

## 4.8. Most do Etapu 5
- Dołożymy GPT, który z `offers` wygeneruje ładną, zwięzłą odpowiedź tekstową (bez halucynacji), zachowując zasady z PRD (styl, brak wymyślania ofert, krótkie dopytania przy braku danych).
