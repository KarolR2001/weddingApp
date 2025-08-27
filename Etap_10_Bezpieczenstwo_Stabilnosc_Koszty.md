# Etap 10 — Bezpieczeństwo, stabilność, koszty (Windows 10, lokalnie)

> Cel: utwardzić mikroserwis i łańcuch Node → AI: brak publicznej ekspozycji ai‑service, token wewnętrzny, limity rozmiarów, prosta moderacja, timeouty/retry, kontrola kosztów. Zgodne z PRD.

---

## 10.0. Wymagania
- Etapy 1–9 działają (AI-service + Qdrant + Node).

---

## 10.1. ENV (kluczowe ustawienia)
Dodaj do `ai-service/.env` (przykład):
```env
# Bezpieczeństwo
INTERNAL_TOKEN=dev-internal-token-CHANGE_ME
REQUEST_MAX_BYTES=262144
MAX_MESSAGE_CHARS=800

# Timeouty / retry
HTTP_TIMEOUT_S=15
OPENAI_TIMEOUT_S=20
QDRANT_TIMEOUT_S=10
HTTP_RETRY_ATTEMPTS=1
HTTP_RETRY_BACKOFF_S=0.8

# Koszty GPT
GPT_MAX_TOKENS=350
GPT_TEMPERATURE=0.2
GPT_OSZCZEDNY=true

# Logi
LOG_LEVEL=INFO
LOG_HASH_SALT=local-dev
```
Upewnij się, że `Settings` w `app/config.py` zawiera odpowiadające pola.

---

## 10.2. Compose — brak publicznej ekspozycji ai‑service
- Zalecenie: nie mapować portu `ai-service` na hosta (usuń `ports:` dla `ai-service`); komunikacja tylko po sieci Compose.
- Jeśli musisz testować z hosta: mapuj na `127.0.0.1:8000:8000`.

---

## 10.3. Middleware (rozmiar żądań, timing) — lekko
- Ogranicz rozmiar body po `Content-Length`; odrzuć 413 gdy > `REQUEST_MAX_BYTES`.
- Loguj czas obsługi żądania (ms) — pomocne przy diagnozie.

---

## 10.4. Moderacja i anonimizacja (lekkie)
- Prosty filtr treści (lista wzorców niepożądanych słów/fraz), odpowiedź grzeczna w razie naruszeń.
- OpenAI moderacja przez API (content policy check) przed wywołaniem Chat Completions.
- Sanityzacja PII (email/telefon) przed logowaniem; loguj hash treści (`LOG_HASH_SALT`).
- Przeciwdziałanie prompt injection: wzmocniony system prompt ignorujący próby manipulacji.

---

## 10.5. Timeouty i 1 retry
- OpenAI: ustaw timeout, 1 retry z backoffem.
- Qdrant: timeout klienta i prosty retry w `search`.
- Backend Node (httpx): 1 retry na GET z krótkim backoffem.

Wskazówki:
```python
# OpenAI: client = OpenAI(timeout=settings.OPENAI_TIMEOUT_S)
# Retry: for i in range(settings.HTTP_RETRY_ATTEMPTS+1): try: ... except: sleep(backoff)
```

---

## 10.6. Walidacja wejścia
- Waliduj długość `message` w modelu Pydantic (<= `MAX_MESSAGE_CHARS`).
- W endpointzie — szybki komunikat, jeśli zbyt długie wejście.

---

## 10.7. Kontrola kosztów (praktyki)
- Skracaj kontekst: przekazuj **ostatnie 3–5** wiadomości, resztę streszczaj.
- Ogranicz `GPT_MAX_TOKENS` (np. 250–400) i liczbę ofert przekazywanych do GPT (top 3–5).
- Utrzymuj `temperature` niską (0.2–0.4) dla zwięzłych odpowiedzi.

---

## 10.8. Checklista zgodności z PRD
- [ ] ai‑service nie jest publicznie wystawiony (lub tylko `127.0.0.1`).
- [ ] `X-Internal-Token` wymagany i sprawdzany.
- [ ] Limity rozmiarów/tekstu działają; moderacja filtruje.
- [ ] Timeouty + 1 retry na OpenAI/Qdrant/Backend.
- [ ] Logi: poziom z ENV, hash treści, czasy żądań.
- [ ] Koszty pod kontrolą (tokens, skracanie kontekstu, liczba ofert).
