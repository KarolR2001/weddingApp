# Etap 12 — Dokumentacja i skrypty „one‑touch” (Windows 10, lokalnie)

> **Cel etapu:** przygotować komplet **czytelnej dokumentacji** i **jedno‑komendowych skryptów** do uruchamiania, zatrzymywania, zasiewania danych, reindeksu i diagnostyki całego systemu zgodnie z PRD i wcześniejszymi etapami (0–11).  
> Po tym etapie masz pliki, które pozwalają Ci *nie myśleć*, tylko **odhaczać polecenia**.

---

## 12.0. Wymagania
- Repo z modułami: `ai-service` (FastAPI), `backend` (Node), `frontend` (React), Qdrant, MySQL (lokalny poza Compose).
- `.env` w modułach uzupełnione (zwł. `OPENAI_API_KEY`, `INTERNAL_TOKEN`).

---

## 12.1. `.env.example` (skrót) — `ai-service/`
```env
EMBEDDING_MODEL=paraphrase-multilingual-MiniLM-L12-v2
VECTOR_SIZE=384
QDRANT_URL=http://qdrant:6333
QDRANT_COLLECTION=wedding_listings_v1
OPENAI_API_KEY=sk-XXXX
INTERNAL_TOKEN=dev-internal-token-CHANGE_ME
DATA_SOURCE=backend
BACKEND_BASE_URL=http://backend:3000
```

Backend/Frontend analogicznie: `AI_SERVICE_URL`, `AI_INTERNAL_TOKEN`, `VITE_API_BASE`.

---

## 12.2. Skrypty PowerShell (one‑touch)
Utwórz `scripts/` i dodaj:
- `dev-up.ps1` — podnosi compose + healthcheck,
- `dev-down.ps1` — zatrzymuje środowisko,
- `seed.ps1` — uruchamia seeding backendu,
- `reindex.ps1` — POST `/recommendation/reindexAll`,
- `health.ps1` — proste sprawdzenia `/health` i przykładowe zapytanie `/assistant/query`,
- `logs.ps1` — tail logów.

Lekkie szkice (przykład):
```powershell
# dev-up.ps1
param([switch]$Rebuild)
if ($Rebuild) { docker compose build }
docker compose up -d
.\scripts\\health.ps1
```
```powershell
# reindex.ps1
$body = @{ limit = 1000; batch = 64 } | ConvertTo-Json
Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:8000/recommendation/reindexAll" -Method POST -Headers @{ "Content-Type" = "application/json"; "X-Internal-Token" = "dev-internal-token-CHANGE_ME" } -Body $body | Out-Null
Write-Host "Reindeks zakończony - sprawdź logi ai-service"
```

---

## 12.3. README (główny) — szybki start
- Wymagania → Konfiguracja `.env` → `scripts/dev-up.ps1` → `scripts/seed.ps1` → `scripts/reindex.ps1` → test E2E → diagnostyka (`scripts/logs.ps1`).

---

## 12.4. Checklista zamknięcia
- [ ] `.env.example` → `.env` uzupełnione.
- [ ] `dev-up.ps1` podnosi środowisko; healthcheck OK.
- [ ] `seed.ps1` zadziałał (backend seed).
- [ ] `reindex.ps1` zakończył się sukcesem.
- [ ] README prowadzi krok po kroku bez domysłów.
