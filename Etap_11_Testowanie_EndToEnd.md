# Etap 11 – Testy end‑to‑end (lokalnie)

> Cel: sprawdzić pełny przepływ Frontend → Backend Node → AI‑service → Qdrant (+ OpenAI), zgodnie z PRD. MySQL jest lokalny poza Compose (jak w Etapach 0–1), o ile nie używasz własnego Compose.

---

## 11.0. Środowisko
- Uruchom: `docker compose up -d` (backend, ai‑service, qdrant; MySQL lokalny).
- Zweryfikuj `docker compose ps` (usługi działają).

---

## 11.1. Scenariusze funkcjonalne (z PRD)
A) Fotograf Warszawa do 4000
- W czacie (frontend) wpisz: „Szukam fotografa w Warszawie do 4000 zł”.
- Oczekiwane: brak dopytania (komplet info), oferty fotografów z Warszawy, w budżecie lub lekko ponad (oznaczone), JSON: `{ reply, offers }`.

B) Fryzjer Gdańsk (bez budżetu)
- Wpisz: „Potrzebuję fryzjera w Gdańsku”.
- Oczekiwane: lista fryzjerów z Gdańska; dopytanie o budżet – zależnie od `ASK_FOR_BUDGET`.

C) Brak wyników → alternatywy
- Wpisz: „Szukam DJ-a w Pcimiu Dolnym za 200 zł”.
- Oczekiwane: grzeczna informacja o braku dopasowań + sugestie rozszerzenia kryteriów (miasto/budżet) lub alternatywne oferty.

---

## 11.2. Regresja UI
- Desktop i mobile (DevTools): autoscroll, „bot pisze…”, linki do ofert, Enter/Shift+Enter.

---

## 11.3. Dłuższe rozmowy
- Zapytanie ogólne → doprecyzowania → utrzymanie kontekstu (Etap 6: slots, summary po progu `CTX_SUMMARIZE_AFTER`).

---

## 11.4. Obciążenie symboliczne
- 10 równoległych zapytań: wszystkie odpowiedzi < 2s, brak 500 w logach.

---

## 11.5. (Opcj.) Automatyzacja E2E
- Cypress/Playwright – 1–2 testy smoke (fotograf Warszawa, fryzjer Gdańsk).

---

## 11.6. Logi i błędy
- Sprawdź logi ai‑service (`docker logs ai-service`), backendu i Qdrant.
- Oceń czasy żądań; brak błędów moderacji/limitów w normalnych scenariuszach.

---

## 11.7. Kryteria akceptacji
- [ ] Scenariusze A/B/C przechodzą zgodnie z PRD.
- [ ] UI OK na desktopie i mobilu.
- [ ] Kontekst działa (sesja, sloty, summary).
- [ ] Obciążenie symboliczne bez błędów 5xx.
- [ ] Test(y) E2E smoke przechodzą.
