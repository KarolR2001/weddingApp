# Etap 8 — Frontend (React) – minimalny czat (Windows 10, lokalnie)

> Cel: zbudować minimalny UI czatu w React, który wysyła zapytania do backendu Node (`POST /api/assistant/query`) i renderuje odpowiedź (`reply`) + listę ofert. Zgodne z PRD: front nie zna sekretów; cała komunikacja przez backend.

---

## 8.0. Wymagania
- Backend Node z Etapu 7 (`/api/assistant/query`).
- Działające `qdrant` + `ai-service` (Etapy 1–6).
- Node.js v18+ lokalnie.

---

## 8.1. Projekt React (Vite) – skrót
```powershell
Set-Location C:\dev\weddingapp
npm create vite@latest frontend -- --template react
Set-Location .\frontend
npm install
```

ENV frontendu (`frontend/.env`):
```text
VITE_API_BASE=http://localhost:3000
```

---

## 8.2. Klient API (lekko)
`src/api/assistant.ts/js`:
```js
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
export async function assistantQuery({ message, sessionId }) {
  const res = await fetch(`${API_BASE}/api/assistant/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // { reply, offers, ... }
}
```

---

## 8.3. Minimalny UI czatu (kroki)
- Komponent `ChatWindow`:
  - Lokalny stan: `messages[]` ({role: "user"|"assistant", text}), `input`, `loading`, `sessionId` (np. `crypto.randomUUID()`).
  - Render: lista bąbli, input, przycisk Wyślij; stan „bot pisze…”.
  - Obsługa Enter/Shift+Enter; autoscroll po każdej wiadomości.
  - Po wysłaniu: dodaj bąbel usera → wywołaj `assistantQuery` → dodaj bąbel z `reply`; jeśli są `offers`, dołącz listę (np. 3–5 linków tytuł + URL).

Lekkie szkice:
```jsx
function ChatWindow() {
  const [messages, setMessages] = useState([{ role: "assistant", text: "Cześć! Jak mogę pomóc?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());

  async function send() {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setMessages(m => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await assistantQuery({ message: text, sessionId });
      let reply = res.reply || "";
      if (Array.isArray(res.offers) && res.offers.length) {
        const links = res.offers.slice(0, 5).map((o, i) => `${i+1}. ${o.title}${o.url ? ` — ${o.url}` : ""}`).join("\n");
        reply = reply ? `${reply}\n\nPolecane oferty:\n${links}` : links;
      }
      setMessages(m => [...m, { role: "assistant", text: reply || "(pusto)" }]);
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", text: `Błąd: ${e.message}` }]);
    } finally { setLoading(false); }
  }
}
```

---

## 8.4. CORS (jeśli dev na innych portach)
Jeśli front 5173 ↔ back 3000: w Node dodaj `cors()` z `origin: ["http://localhost:5173"]`.

---

## 8.5. Testy ręczne (E2E)
- „fotograf Warszawa do 4000” → odpowiedź (`reply`) + linki do ofert.
- „fryzjer Gdańsk” → odpowiedź z ofertami.
- Brak wyników → grzeczny komunikat (z Etapu 5) lub pusta lista.

---

## 8.6. Checklista (zgodność z PRD)
- [ ] Front wywołuje wyłącznie `/api/assistant/query` (proxy Node).
- [ ] Brak sekretów w przeglądarce.
- [ ] UI prezentuje `reply` i listę ofert (klikalne linki), działa Enter/Shift+Enter, ma stan „bot pisze…”.
- [ ] Responsywność i autoscroll.
