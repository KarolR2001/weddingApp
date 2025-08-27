# Etap 6 — Kontekst rozmowy i dopytywanie (Windows 10, lokalnie)

> Cel: dodać do mikroserwisu AI pamięć sesji i inteligentne dopytywanie. `/assistant/query` ma korzystać z kontekstu i pytać o brakujące dane (kategoria/miasto, opcj. budżet) zanim wykona rekomendację. Zgodne z PRD.

---

## 6.0. Wymagania wstępne
- Zrobione Etapy 2–5 (FastAPI, Qdrant, indeksowanie, query, GPT-odpowiedź).
- `qdrant` i `ai-service` działają.
- W `.env`: `OPENAI_API_KEY`, `QDRANT_URL`, `INTERNAL_TOKEN` (i pola z Etapu 5).

---

## 6.1. Konfiguracja kontekstu (ENV + Settings)
- `.env` (wartości przykładowe):
```text
CTX_KEEP_LAST=4           # ile ostatnich wiadomości przekazać do GPT „as-is”
CTX_SUMMARIZE_AFTER=8     # od ilu wiadomości streszczać starsze
ASK_FOR_BUDGET=true       # czy traktować budżet jako krytyczny
LANG=pl
```
- `app/config.py` (klasa `Settings`):
```python
CTX_KEEP_LAST: int = Field(default=4)
CTX_SUMMARIZE_AFTER: int = Field(default=8)
ASK_FOR_BUDGET: bool = Field(default=True)
LANG: str = Field(default="pl")
```

---

## 6.2. Pamięć sesji (lekka struktura)
- `app/session.py` — lekka pamięć in‑memory na czas dev (1 replika):
```python
@dataclass
class ChatMessage:  # role: "user"|"assistant"|"system"
    role: str
    content: str

@dataclass
class Slots:  # sticky parametry
    category: str | None = None
    city: str | None = None
    budget_min: int | None = None
    budget_max: int | None = None

@dataclass
class ChatSession:
    session_id: str
    messages: list[ChatMessage] = field(default_factory=list)
    summary: str | None = None
    slots: Slots = field(default_factory=Slots)
```
- `SessionStore.get_or_create(sessionId)` → zwraca/zakłada sesję; `recent(n)` dla ostatnich N wiadomości.

---

## 6.3. Slot‑filling i dopytywanie (reguły)
- `app/slots.py` — reguły ekstrakcji i decyzji:
```python
CRITICAL = ("category", "city")  # budżet opcjonalny wg ASK_FOR_BUDGET

def extract_slots_from_text(text: str) -> Slots:  # używa parse_* z Etapu 4
    ...  # category, city, budget_min, budget_max

def missing_critical(slots: Slots, ask_for_budget: bool) -> list[str]:
    ...  # zwraca listę braków (np. ["category","city"] lub ["budget"]) 

def build_clarifying_question(missing: list[str]) -> str:
    # Jedno, krótkie pytanie łączące brakujące elementy
    return "Potrzebuję jeszcze: ... (kategoria/miasto/budżet). Jakie są te informacje?"
```

---

## 6.4. Streszczenie historii (opcjonalne)
- W `app/gpt.py` dodaj funkcję streszczenia (2–3 zdania / 3–5 punktów) dla starszej części rozmowy, wywoływaną gdy `len(messages) >= CTX_SUMMARIZE_AFTER`.
- Jeśli GPT niedostępny, fallback: skrót do 2 ostatnich wiadomości.

---

## 6.5. Zmiany w `/assistant/query` (kroki)
1) Identyfikuj sesję (`sessionId`), pobierz/utwórz `ChatSession`.
2) Zapisz wiadomość użytkownika w historii.
3) Ekstrakcja bieżących slotów z tekstu (`extract_slots_from_text`) i scalenie ze sticky slotami sesji.
4) Decyzja: jeśli brakuje krytycznych danych (`missing_critical`), zbuduj pytanie (`build_clarifying_question`), zapisz w historii i zwróć:
```json
{ "reply": "Pytanie doprecyzowujące...", "offers": [], "followUp": { "needed": true } }
```
5) Jeśli dane kompletne: przygotuj kontekst GPT (streszczenie + `recent(CTX_KEEP_LAST)`).
6) Wykonaj wyszukiwanie w Qdrant (jak w Etapie 4) z filtrami z `slots`.
7) Zbuduj listę ofert (preferuj 3–5 do promptu; całość zwróć w `offers`).
8) Wygeneruj ładną odpowiedź GPT (funkcja z Etapu 5, system prompt anty‑halucynacje), zapisz w sesji i zwróć:
```json
{ "reply": "...", "offers": [ ... ], "followUp": { "needed": false }, "session": { "sessionId": "...", "slots": { ... } } }
```

---

## 6.6. Zgodność z PRD (kontrola)
- [x] Pamięć kontekstu (ostatnie N + streszczenia starszych) w `/assistant/query`.
- [x] Jedno, zwięzłe pytanie dopytujące przy brakach (zamiast nietrafionej rekomendacji).
- [x] Re‑use wyszukiwania z Etapu 4 (spójny filtr + embedding).
- [x] Anty‑halucynacje (GPT używa tylko listy przekazanych ofert).

---

## 6.7. Testy ręczne (przykłady)
- „Szukam fotografa” → dopytanie o miasto (i budżet, jeśli włączony).
- Kontynuacja tej samej sesji: „Kraków do 4000” → prezentacja ofert fotografów w Krakowie.
- Rozmowa > `CTX_SUMMARIZE_AFTER` → w logach widoczne wywołanie streszczenia i krótszy kontekst.

---

## 6.8. Uwaga wdrożeniowa
- In‑memory `SessionStore` działa tylko dla jednej repliki (dev). W skali produkcyjnej użyj Redis (klucze `session:{id}`) — poza zakresem tego etapu.
