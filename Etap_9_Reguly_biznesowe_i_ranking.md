# Etap 9 — Reguły biznesowe i ranking — Windows 10, lokalnie

> Cel: poprawić trafność wyników: progi budżetu (twarde/miękkie), preferencja po `rating` (+opcjonalnie `reviewsCount`), różnorodność vendorów (max 1 pozycja w top N). Re‑ranking po otrzymaniu kandydatów z Qdrant. Zgodne z PRD.

---

## 9.0. Wymagania
- Etapy 3–6 wykonane; payload w Qdrant zawiera `priceMin/Max`, `rating`, (opcjonalnie) `vendorId`, `reviewsCount`.
- `ai-service` i `qdrant` działają; możesz przebudować obraz `ai-service`.

---

## 9.1. Parametry rankingowe (ENV + Settings)
- `.env` (wartości przykładowe):
```ini
# Budżet
BUDGET_SOFT_MAX_MULT=1.20
BUDGET_HARD_MAX_MULT=1.50
BUDGET_IN_BAND_BOOST=0.05
BUDGET_SOFT_PENALTY=0.15

# Oceny/recenzje
RATING_WEIGHT=0.10
RATING_MAX=5.0
REVIEWS_WEIGHT=0.05
REVIEWS_PIVOT=20

# Różnorodność
DIVERSITY_VENDOR_ENABLED=true
```
- `app/config.py` → dodaj odpowiednie pola w `Settings` (jak powyżej).

---

## 9.2. Warstwa re‑rankingu (opis)
Cel: z listy kandydatów od Qdrant (np. 30) wybrać top N po zastosowaniu reguł:
- Budżet: odfiltruj skrajnie drogie (twardy próg), lekko ponad budżet — zostaw, ale z **karą**; w budżecie — **bonus**.
- Ocena: dodaj mały bonus za wyższy `rating` (0..5), z normalizacją.
- Recenzje (opcjonalnie): bonus logarytmiczny względem `reviewsCount`.
- Różnorodność: max 1 pozycja jednego vendora (po `vendorId`).

Lekkie API modułu:
```python
# app/ranking.py

def rerank(candidates: list[dict], *, budget_min: int | None, budget_max: int | None, top_n: int, diversity_vendor: bool) -> tuple[list[dict], dict]:
    """Zwraca (lista_top, debug). Każdy element: { id, payload, base_score, score, note? }"""
    ...
```

Implementacja (wewnątrz):
- policz `score = clamp(base_sim) * budget_mult + rating_bonus + reviews_bonus`;
- odrzuć po twardym progu (`BUDGET_HARD_MAX_MULT`);
- sort malejąco po `score`; wybierz do N, pilnując różnorodności (zbiór `vendorId`).
- `note` (np. „nieco powyżej budżetu” / „w budżecie”) można dołączyć do oferty.

---

## 9.3. Integracja w `/recommendation/query`
1) Pobierz nieco więcej kandydatów z Qdrant (np. `limit=max(req.limit, 30)`), zmapuj do listy:
```python
candidates = [{
  "id": int(payload.get("id") or r.id),
  "payload": payload,
  "base_score": float(getattr(r, "score", 0.0)),
} for r in results]
```
2) Wywołaj `rerank(...)` z `budget_min/max` i `top_n=req.limit`.
3) Zmapuj na `OfferLite`; przekaż `note` (opcjonalnie dodaj do `snippet`).
4) W `debug` dodaj statystyki re‑ranku (np. ilu odrzucono po hard progu).

---

## 9.4. Uzupełnienie payloadu (rekomendowane) i reindeks
- Jeśli nie masz `vendorId`/`reviewsCount` w payloadzie (Etap 3) — dodaj (vendor = stały identyfikator wykonawcy, liczba recenzji) i uruchom reindeks (`/recommendation/reindexAll`).

---

## 9.5. Testy ręczne (skrót)
- „fotograf Kraków do 4000” → oferty w budżecie na górze; znacznie powyżej — odrzucone; lekko powyżej — niżej + `note`.
- Zwiększ `RATING_WEIGHT` i sprawdź, czy oferty z 4.8–5.0 zyskują.
- Zduplikowane vendorId w kandydatkach → w top N tylko jedna pozycja.

---

## 9.6. Checklista zgodności z PRD
- [ ] Re‑ranking zastosowany (budżet, rating, różnorodność).
- [ ] Debug rankingowy w odpowiedzi (`/recommendation/query`).
- [ ] Payload uzupełniony o `vendorId`/`reviewsCount` lub zaplanowany reindeks.
- [ ] Finałowa lista top N prezentuje różnorodnych vendorów i sensowne budżety.
