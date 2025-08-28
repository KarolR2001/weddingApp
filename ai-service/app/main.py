from fastapi import FastAPI, Depends, Path
from fastapi.responses import JSONResponse
from starlette.status import HTTP_200_OK
from app.config import settings
from app.logger import logger
from app.errors import AppError, app_error_handler, unhandled_error_handler
from app.embeddings import embed_text, embed_texts
from app.qdrant_client import get_qdrant
from app.auth import verify_internal_token
from app.schemas import (
    ListingPayload, UpdateEmbeddingRequest, UpdateEmbeddingResponse,
    RemoveEmbeddingResponse, ReindexAllRequest, ReindexAllResponse,
)
from app.domain import build_listing_text_for_embedding
from app.data_access import DataAccess
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import re
from qdrant_client.http.models import Filter, FieldCondition, MatchValue
from openai import OpenAI
from app.session import store, ChatMessage, Slots
from app.slots import extract_slots_from_text, missing_critical, build_clarifying_question
from app.query_parse import parse_budget, parse_city, parse_category


app = FastAPI(title="WeddingApp AI Service", version="0.1.0")

# Handlery wyjątków
app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(Exception, unhandled_error_handler)


@app.get("/health")
def health():
    vec = embed_text("healthcheck")
    qdr = get_qdrant()
    return JSONResponse(
        status_code=HTTP_200_OK,
        content={
            "status": "ok",
            "vector_len": len(vec),
            "qdrant_collection": settings.QDRANT_COLLECTION,
            "embedding_model": settings.EMBEDDING_MODEL,
        },
    )


@app.post("/recommendation/updateEmbedding", response_model=UpdateEmbeddingResponse, dependencies=[Depends(verify_internal_token)])
async def update_embedding(req: UpdateEmbeddingRequest):
    if not req.listingId and not req.listing:
        raise AppError("Provide listingId or listing payload")

    data_source = DataAccess()
    if req.listing is not None:
        listing = req.listing.model_dump()
    else:
        listing = await data_source.get_listing_by_id(int(req.listingId))
        if listing is None:
            raise AppError(f"Listing id={req.listingId} not found", status_code=404)

    text = build_listing_text_for_embedding(listing)
    vec = embed_text(text)

    payload = {
        "id": listing["id"],
        "title": listing.get("title"),
        "category": listing.get("category"),
        "city": listing.get("city"),
        "priceMin": listing.get("priceMin"),
        "priceMax": listing.get("priceMax"),
        "rating": listing.get("rating"),
        "features": listing.get("features"),
        "url": listing.get("url"),
        "vendorId": listing.get("vendorId"),
        "reviewsCount": listing.get("reviewsCount"),
        "offersNationwideService": listing.get("offersNationwideService", False),
    }

    qdr = get_qdrant()
    qdr.upsert_point(point_id=listing["id"], vector=vec, payload=payload)

    return UpdateEmbeddingResponse(
        updated=True,
        id=listing["id"],
        vector_len=len(vec),
        payload_keys=sorted(list(payload.keys())),
    )


@app.delete("/recommendation/removeEmbedding/{listingId}", response_model=RemoveEmbeddingResponse, dependencies=[Depends(verify_internal_token)])
async def remove_embedding(listingId: int = Path(..., description="ID oferty")):
    qdr = get_qdrant()
    qdr.delete_point(point_id=listingId)
    return RemoveEmbeddingResponse(removed=True, id=listingId)


@app.post("/recommendation/reindexAll", response_model=ReindexAllResponse, dependencies=[Depends(verify_internal_token)])
async def reindex_all(req: ReindexAllRequest):
    data_source = DataAccess()

    items = []
    count = 0
    async for it in data_source.iter_all_listings():
        items.append(it)
        count += 1
        if req.limit and count >= req.limit:
            break

    if not items:
        return ReindexAllResponse(indexed=0, skipped=0)

    texts = [build_listing_text_for_embedding(x) for x in items]
    vectors = []
    for i in range(0, len(texts), req.batch):
        batch_texts = texts[i:i + req.batch]
        batch_vectors = embed_texts(batch_texts)
        vectors.extend(batch_vectors)

    qdr = get_qdrant()
    indexed = 0
    skipped = 0
    for it, vec in zip(items, vectors):
        payload = {
            "id": it["id"],
            "title": it.get("title"),
            "category": it.get("category"),
            "city": it.get("city"),
            "priceMin": it.get("priceMin"),
            "priceMax": it.get("priceMax"),
            "rating": it.get("rating"),
            "features": it.get("features"),
            "url": it.get("url"),
            "vendorId": it.get("vendorId"),
            "reviewsCount": it.get("reviewsCount"),
            "offersNationwideService": it.get("offersNationwideService", False),
        }
        try:
            qdr.upsert_point(point_id=it["id"], vector=vec, payload=payload)
            indexed += 1
        except Exception:
            skipped += 1

    return ReindexAllResponse(indexed=indexed, skipped=skipped)


# === Etap 4: Query bez GPT ===

class QueryRequest(BaseModel):
    message: str
    sessionId: Optional[str] = None
    limit: int = Field(default=10, ge=1, le=50)


class OfferLite(BaseModel):
    id: int
    title: Optional[str] = None
    city: Optional[str] = None
    category: Optional[str] = None
    priceMin: Optional[int] = None
    priceMax: Optional[int] = None
    url: Optional[str] = None
    score: float
    snippet: Optional[str] = None


class QueryResponse(BaseModel):
    offers: List[OfferLite]
    debug: Optional[Dict] = None


def parse_budget(msg: str) -> tuple[Optional[int], Optional[int]]:
    m = re.search(r"(\d+)\s*[-–]\s*(\d+)", msg)
    if m:
        lo, hi = int(m.group(1)), int(m.group(2))
        if lo > hi:
            lo, hi = hi, lo
        return lo, hi
    m = re.search(r"\bdo\s*(\d+)\b", msg, re.IGNORECASE)
    if m:
        return None, int(m.group(1))
    m = re.search(r"\bod\s*(\d+)\b", msg, re.IGNORECASE)
    if m:
        return int(m.group(1)), None
    m = re.search(r"\b(\d{3,5})\s*(zł|pln)?\b", msg, re.IGNORECASE)
    if m:
        return None, int(m.group(1))
    return None, None


def parse_city(msg: str) -> Optional[str]:
    # Prosta heurystyka: słowo zaczynające się wielką literą z polskimi znakami
    tokens = re.findall(r"[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ-]+", msg)
    # Filtruj oczywiste nie-miasta (np. pierwsze słowo zdania). Zostawmy najczęstszy przypadek: drugi/ trzeci token.
    for t in tokens:
        # krótka czarna lista
        if t.lower() in {"szukam", "potrzebuję", "dj", "fotograf", "kamerzysta"}:
            continue
        return t
    return None


def parse_category(msg: str) -> Optional[str]:
    # Minimalny parser: rozpoznaje słowa-klucze, ale ponieważ w payload mamy category jako string id,
    # bez mapowania kategorii -> id zwracamy None, by uniknąć błędnego filtrowania.
    # (Zgodnie z PRD: heurystyki mogą być proste; dokładniejsze mapowanie w późniejszych etapach.)
    kw = ["fotograf", "kamera", "kamerzysta", "dj", "zespół", "muzyka", "sala", "dekoracje", "kwiaty"]
    if any(k in msg.lower() for k in kw):
        return None
    return None


def build_budget_filter(bmin: Optional[int], bmax: Optional[int]) -> List[FieldCondition]:
    fc: List[FieldCondition] = []
    if bmin is None and bmax is None:
        return fc
    if bmin is not None and bmax is not None:
        fc.append(FieldCondition(key="priceMin", match=MatchValue(value=bmax)))  # will be combined logically; post-filter logic not supported
        fc.append(FieldCondition(key="priceMax", match=MatchValue(value=bmin)))
        # Uwaga: Qdrant nie wspiera nierówności w MatchValue – budżet doprecyzujemy w Etapie 9 lub przez post-filtering.
        # Na Etap 4 można pominąć budżet w twardym filtrze i użyć tylko podobieństwa.
        return []
    # Analogicznie jak wyżej – na Etap 4 pomijamy twardy budżet (zostawiamy do Etapu 9).
    return []


def merge_results(res1, res2, limit: int):
    by_id = {}
    for r in (res1 or []):
        by_id[str(r.id)] = r
    for r in (res2 or []):
        if str(r.id) not in by_id or r.score > by_id[str(r.id)].score:
            by_id[str(r.id)] = r
    # sort by score desc
    merged = sorted(by_id.values(), key=lambda x: x.score, reverse=True)
    return merged[:limit]


@app.post("/recommendation/query", response_model=QueryResponse, dependencies=[Depends(verify_internal_token)])
def recommendation_query(req: QueryRequest):
    message = req.message or ""
    limit = req.limit

    category = parse_category(message)
    city = parse_city(message)
    bmin, bmax = parse_budget(message)

    vector = embed_text(message)
    qdr = get_qdrant()

    # Filtry: zbuduj dwa zapytania jeśli mamy miasto: (city) OR (offersNationwideService=true)
    base_must: List[FieldCondition] = []
    if category:
        base_must.append(FieldCondition(key="category", match=MatchValue(value=category)))
    # Budżet na Etap 4 pomijamy w filtrach (patrz komentarz w build_budget_filter)

    res_city = None
    res_nat = None
    if city:
        f_city = Filter(must=base_must + [FieldCondition(key="city", match=MatchValue(value=city))])
        res_city = qdr.search(query_vector=vector, limit=limit, qfilter=f_city)
        f_nat = Filter(must=base_must + [FieldCondition(key="offersNationwideService", match=MatchValue(value=True))])
        res_nat = qdr.search(query_vector=vector, limit=limit, qfilter=f_nat)
        results = merge_results(res_city, res_nat, limit)
    else:
        f = Filter(must=base_must) if base_must else None
        results = qdr.search(query_vector=vector, limit=limit, qfilter=f)

    offers: List[OfferLite] = []
    for r in results:
        p = r.payload or {}
        price_min = p.get("priceMin")
        price_max = p.get("priceMax")
        city_p = p.get("city")
        snips = []
        if city_p:
            snips.append(str(city_p))
        if price_min is not None or price_max is not None:
            snips.append(f"Cena: {price_min or ''}-{price_max or ''}")
        snippet = " • ".join(snips) if snips else None
        offers.append(OfferLite(
            id=int(p.get("id") or r.id),
            title=p.get("title"),
            city=city_p,
            category=p.get("category"),
            priceMin=price_min,
            priceMax=price_max,
            url=p.get("url"),
            score=float(r.score),
            snippet=snippet,
        ))

    dbg = {"detected": {"category": category, "city": city, "budget_min": bmin, "budget_max": bmax}, "limit": limit}
    return QueryResponse(offers=offers, debug=dbg)


# === Etap 5: Integracja z GPT (ładna odpowiedź) ===

SYSTEM_PROMPT_PL = (
    "Jesteś asystentem WeddingApp. Odpowiadaj po polsku.\n"
    "- Nie wymyślaj spoza listy DOSTĘPNE OFERTY.\n"
    "- Jeśli lista jest pusta lub brakuje danych — zapytaj o doprecyzowanie jednym zwięzłym pytaniem.\n"
    "- Wypunktuj 3–6 ofert: tytuł, miasto, widełki cen, jedna cecha.\n"
)


class AssistantQueryRequest(QueryRequest):
    pass


class AssistantQueryResponse(BaseModel):
    reply: str
    offers: List[OfferLite]
    debug: Optional[Dict] = None


def _search_offers_for_message(message: str, limit: int) -> tuple[List[OfferLite], Dict]:
    category = parse_category(message)
    city = parse_city(message)
    bmin, bmax = parse_budget(message)

    vector = embed_text(message)
    qdr = get_qdrant()

    base_must: List[FieldCondition] = []
    if category:
        base_must.append(FieldCondition(key="category", match=MatchValue(value=category)))

    res_city = None
    res_nat = None
    if city:
        f_city = Filter(must=base_must + [FieldCondition(key="city", match=MatchValue(value=city))])
        res_city = qdr.search(query_vector=vector, limit=limit, qfilter=f_city)
        f_nat = Filter(must=base_must + [FieldCondition(key="offersNationwideService", match=MatchValue(value=True))])
        res_nat = qdr.search(query_vector=vector, limit=limit, qfilter=f_nat)
        results = merge_results(res_city, res_nat, limit)
    else:
        f = Filter(must=base_must) if base_must else None
        results = qdr.search(query_vector=vector, limit=limit, qfilter=f)

    offers: List[OfferLite] = []
    for r in results:
        p = r.payload or {}
        price_min = p.get("priceMin")
        price_max = p.get("priceMax")
        city_p = p.get("city")
        snips = []
        if city_p:
            snips.append(str(city_p))
        if price_min is not None or price_max is not None:
            snips.append(f"Cena: {price_min or ''}-{price_max or ''}")
        snippet = " • ".join(snips) if snips else None
        offers.append(OfferLite(
            id=int(p.get("id") or r.id),
            title=p.get("title"),
            city=city_p,
            category=p.get("category"),
            priceMin=price_min,
            priceMax=price_max,
            url=p.get("url"),
            score=float(r.score),
            snippet=snippet,
        ))

    dbg = {"detected": {"category": category, "city": city, "budget_min": bmin, "budget_max": bmax}, "limit": limit}
    return offers, dbg


@app.post("/assistant/query", response_model=AssistantQueryResponse, dependencies=[Depends(verify_internal_token)])
def assistant_query(req: AssistantQueryRequest):
    # Pamięć sesji
    session_id = req.sessionId or "default"
    sess = store.get_or_create(session_id)
    sess.messages.append(ChatMessage(role="user", content=req.message))

    # Slot-filling
    incoming = extract_slots_from_text(req.message)
    # scal ze sticky slotami (uzupełniaj brakujące)
    merged = Slots(
        category=incoming.category or sess.slots.category,
        city=incoming.city or sess.slots.city,
        budget_min=incoming.budget_min if incoming.budget_min is not None else sess.slots.budget_min,
        budget_max=incoming.budget_max if incoming.budget_max is not None else sess.slots.budget_max,
    )
    sess.slots = merged
    need = missing_critical(merged, settings.ASK_FOR_BUDGET)
    if need:
        q = build_clarifying_question(need)
        sess.messages.append(ChatMessage(role="assistant", content=q))
        return AssistantQueryResponse(reply=q, offers=[], debug={"followUp": {"needed": True}, "slots": merged.__dict__})

    # 1) reuse Etap 4 search (z gotowych slotów)
    message = req.message
    limit = req.limit
    # zbuduj „syntetyczne” zapytanie zawierające sloty (pomaga embeddingowi)
    if merged.city or merged.category or merged.budget_min or merged.budget_max:
        parts = [message]
        if merged.category:
            parts.append(str(merged.category))
        if merged.city:
            parts.append(str(merged.city))
        if merged.budget_min or merged.budget_max:
            parts.append(f"budżet {merged.budget_min or ''}-{merged.budget_max or ''}")
        message = " ".join(parts)
    offers, dbg = _search_offers_for_message(message, limit)

    # 2) build prompt with available offers
    lines = []
    for o in offers[: max(3, min(6, len(offers)) )]:
        line = f"- ID {o.id} | {o.title or ''} | {o.city or ''} | {o.category or ''} | cena: {o.priceMin or ''}-{o.priceMax or ''}"
        lines.append(line)
    offers_block = "\n".join(lines) if lines else "(brak)"
    user_prompt = (
        f"Pytanie użytkownika: {req.message}\n\n"
        f"DOSTĘPNE OFERTY:\n{offers_block}\n"
    )

    # 3) call OpenAI Chat Completions
    client = OpenAI()
    completion = client.chat.completions.create(
        model=settings.OPENAI_CHAT_MODEL,
        temperature=float(settings.OPENAI_TEMPERATURE),
        max_tokens=int(settings.OPENAI_MAX_TOKENS),
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT_PL},
            {"role": "user", "content": user_prompt},
        ],
    )
    reply = completion.choices[0].message.content if completion.choices else ""

    sess.messages.append(ChatMessage(role="assistant", content=reply or ""))
    return AssistantQueryResponse(reply=reply or "", offers=offers, debug={"model": settings.OPENAI_CHAT_MODEL, **dbg, "followUp": {"needed": False}, "sessionId": session_id, "slots": merged.__dict__})
