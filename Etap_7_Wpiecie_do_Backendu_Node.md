# Etap 7 — Wpięcie do backendu Node (proxy + wyzwalacze)

> Cel: połączyć mikroserwis AI (FastAPI) z backendem Node: dodać proxy `/api/assistant/query` oraz wywołania aktualizacji/usu­wania embeddingów przy CRUD ofert. Zgodne z PRD.

---

## 7.0. Wymagania
- Działający mikroserwis (`ai-service`) i Qdrant (Etapy 1–6).
- Backend Node.js/Express.

---

## 7.1. Konfiguracja ENV (backend Node)
Dodaj do `.env` backendu:
```text
AI_SERVICE_URL=http://ai-service:8000
AI_INTERNAL_TOKEN=supersekret123  # zgodny z INTERNAL_TOKEN mikroserwisu
```

---

## 7.2. Klient HTTP do mikroserwisu (Node)
Lekka struktura (`services/aiService.js`):
```js
const axios = require("axios");
const aiService = axios.create({
  baseURL: process.env.AI_SERVICE_URL,
  headers: { "X-Internal-Token": process.env.AI_INTERNAL_TOKEN },
  timeout: 10000,
});
module.exports = aiService;
```
*(opcjonalnie) 1‑retry w interceptorze.*

---

## 7.3. Proxy endpoint w Node
`routes/assistantRoutes.js`:
```js
const express = require("express");
const aiService = require("../services/aiService");
const router = express.Router();

router.post("/query", async (req, res) => {
  try {
    const r = await aiService.post("/assistant/query", req.body);
    res.json(r.data);
  } catch (e) {
    console.error("AI Service error:", e.message);
    res.status(502).json({ error: "Assistant service unavailable" });
  }
});

module.exports = router;
```
W `app.js`:
```js
const assistantRoutes = require("./routes/assistantRoutes");
app.use("/api/assistant", assistantRoutes);
```

---

## 7.4. Wyzwalacze embeddingów (CRUD ofert)
W kontrolerze ofert (przykład):
```js
const aiService = require("../services/aiService");

async function createListing(req, res) {
  const newListing = await Listing.create(req.body);
  try { await aiService.post("/recommendation/updateEmbedding", { listingId: newListing.id }); } catch {}
  res.json(newListing);
}

async function updateListing(req, res) {
  const updated = await Listing.update(req.body, { where: { id: req.params.id } });
  try { await aiService.post("/recommendation/updateEmbedding", { listingId: req.params.id }); } catch {}
  res.json(updated);
}

async function deleteListing(req, res) {
  await Listing.destroy({ where: { id: req.params.id } });
  try { await aiService.delete(`/recommendation/removeEmbedding/${req.params.id}`); } catch {}
  res.json({ success: true });
}
```

---

## 7.5. (Opcj.) Compose
Jeśli backend w Compose, w `docker-compose.yml` ustaw `AI_SERVICE_URL=http://ai-service:8000` i `depends_on: [ai-service]`.

---

## 7.6. Checklista (zgodność z PRD)
- [ ] Proxy `/api/assistant/query` działa i zwraca `{ reply, offers }`.
- [ ] Wyzwalacze embeddingów działają (po create/update/delete oferty).
- [ ] Token wewnętrzny (`X-Internal-Token`) zgodny po obu stronach.
- [ ] Błędy mikroserwisu nie blokują CRUD (log + 502 do frontu przy proxy).
