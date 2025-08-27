# Etap 5 — Integracja z GPT (ładna odpowiedź) — Windows 10, lokalnie

> Cel: wzbogacić wynik wyszukiwania (Etap 4) o **ładną odpowiedź tekstową** generowaną przez GPT, **bez halucynacji** (wyłącznie na podstawie przekazanych ofert). Nowy endpoint: `POST /assistant/query` — wewnętrznie wykonuje zapytanie jak w Etapie 4, następnie wywołuje Chat Completions i zwraca `{ reply, offers, debug? }`. Zgodne z PRD (osobny endpoint, bezpieczeństwo przez `X-Internal-Token`).

---

## 5.0. Wymagania wstępne
- Wykonane Etapy 2–4 (FastAPI, indeks, wyszukiwanie bez GPT).
- Kontenery `qdrant` i `ai-service` działają (`docker compose up -d`).
- W `ai-service/.env` masz `OPENAI_API_KEY`.

---

## 5.1. Konfiguracja modelu (ENV + Settings)
- Dodaj do `.env`:
```text
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=600
OPENAI_TEMPERATURE=0.2
```
- W `app/config.py` (klasa `Settings`) dodaj pola:
```python
OPENAI_CHAT_MODEL: str = Field(default="gpt-4o-mini")
OPENAI_MAX_TOKENS: int = Field(default=600)
OPENAI_TEMPERATURE: float = Field(default=0.2)
```

---

## 5.2. Zasady odpowiedzi (system prompt — opis)
- Rola i styl: pomocny asystent WeddingApp, język polski, ton życzliwy, konkretny.
- Ograniczenie: **nie wymyślaj** ofert poza listą wejściową; jeśli brak danych — jedno zwięzłe pytanie doprecyzowujące.
- Prezentacja: **3–6 ofert** w punktach (tytuł + miasto + widełki + 1 zdanie wartości), krótkie podsumowanie.
- Długość: ~6–8 zdań.

Lekka struktura (orientacyjna):
```python
SYSTEM_PROMPT_PL = """
Jesteś asystentem WeddingApp. Odpowiadaj po polsku.
- Nie wymyślaj spoza listy DOSTĘPNE OFERTY.
- Jeśli brakuje krytycznych danych i lista jest pusta/nietrafna — zapytaj o doprecyzowanie.
- Wypunktuj 3–6 ofert: tytuł, miasto, widełki cen, jedna cecha.
"""
```

---

## 5.3. Dane wejściowe/wyjściowe endpointu
- Wejście:
```python
class AssistantQueryRequest(QueryRequest):
    pass  # message, sessionId?, limit (z Etapu 4)
```
- Wyjście:
```python
class AssistantQueryResponse(BaseModel):
    reply: str
    offers: list[OfferLite]  # ten sam format co w Etapie 4
    debug: dict | None = None
```

---

## 5.4. Przepływ w `/assistant/query` (kroki)
1) Wykonaj te same kroki co `/recommendation/query` (Etap 4): parser → embedding → filtr → search w Qdrant → `offers: list[OfferLite]` (limit typowo 3–5 do prezentacji).

2) Przygotuj wejście do GPT (user prompt):
- Wstaw treść pytania użytkownika.
- Dołącz listę „DOSTĘPNE OFERTY” w prostym, tabelarycznym układzie (id, tytuł, kategoria, miasto, widełki, url?, 1–2 cechy jeżeli masz w payloadzie).

3) Wywołaj Chat Completions (OpenAI):
- `model = OPENAI_CHAT_MODEL`, `temperature = OPENAI_TEMPERATURE`, `max_tokens = OPENAI_MAX_TOKENS`.
- `messages = [{role: system, content: SYSTEM_PROMPT_PL}, {role: user, content: <prompt z pkt 2>}]`.

4) Zwróć wynik:
- `reply = <content z odpowiedzi GPT>`.
- `offers = <lista z pkt 1>` (dla wygody frontu, bez parsowania tekstu GPT).
- (Opcj.) `debug` — limit, wyekstrahowane kryteria, filtr, użyty model.

---

## 5.5. Minimalna sygnatura endpointu (FastAPI)
```python
@app.post("/assistant/query", response_model=AssistantQueryResponse, dependencies=[Depends(verify_internal_token)])
def assistant_query(req: AssistantQueryRequest):
    ... # kroki 1–4 powyżej (reuse Etapu 4 + wywołanie GPT)
```

---

## 5.6. Testy manualne (PowerShell)
- Fotograf Kraków do 4000 (limit 3):
```powershell
$body = @{ message = "Szukam fotograf Kraków do 4000"; limit = 3 } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8000/assistant/query" -Method POST -ContentType "application/json" -Headers @{ "X-Internal-Token" = "dev-internal-token-CHANGE_ME" } -Body $body
```
- DJ Warszawa 2500–3500: analogicznie.

Oczekiwane: JSON z `reply` (zwięzła, poprawna stylistycznie odpowiedź, bez halucynacji) + `offers` (lista struktur jak w Etapie 4) + opcjonalny `debug`.

---

## 5.7. Zgodność z PRD (kontrola jakości)
- [x] Osobny endpoint `/assistant/query` (front → Node → ai-service).
- [x] Brak halucynacji — prompt wymusza użycie tylko „DOSTĘPNE OFERTY”.
- [x] Styl: PL, życzliwy, zwięzły; pytania doprecyzowujące gdy brak danych.
- [x] Reuse wyników z Qdrant (Etap 4) — brak duplikacji logiki.
- [x] Brak ujawniania sekretów; `OPENAI_API_KEY` tylko po stronie mikroserwisu.

---

## 5.8. Typowe problemy i szybkie fixy
- 401 Unauthorized — brak/wrong `X-Internal-Token`.
- Invalid API key / model not found — sprawdź `OPENAI_*` w `.env`.
- Zbyt długie odpowiedzi — zmniejsz `OPENAI_MAX_TOKENS` lub liczbę ofert w promptcie (3–5).
- Powolna odpowiedź — model „mini” szybszy; skróć listę ofert.

---

## 5.9. Most do Etapu 6
- Dodamy **pamięć sesji** i dopytywanie przed wywołaniem GPT (slot-filling), aby utrzymać kontekst rozmowy i ograniczać koszty.
