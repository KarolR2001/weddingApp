from __future__ import annotations
from typing import Any, AsyncGenerator, Iterable
import httpx
from app.config import settings


class DataAccess:
    def __init__(self) -> None:
        self.source = settings.DATA_SOURCE

    @staticmethod
    def _normalize_listing(raw: dict[str, Any]) -> dict[str, Any]:
        """Dopasuj pola do schematu używanego przez embedding/Qdrant zgodnie z PRD."""
        listing: dict[str, Any] = dict(raw) if raw else {}
        if "id" not in listing and "listingId" in listing:
            listing["id"] = listing.get("listingId")
        if not listing.get("title") and listing.get("titleOffer"):
            listing["title"] = listing.get("titleOffer")
        if not listing.get("category") and listing.get("categoryId") is not None:
            listing["category"] = str(listing.get("categoryId"))
        return listing

    # --- BACKEND (Node) ---
    async def get_listing_by_id_backend(self, listing_id: int) -> dict[str, Any]:
        # Preferowana ścieżka wg dokumentacji
        primary = f"{settings.BACKEND_BASE_URL}/api/listings/listing/{listing_id}"
        # Fallback „krótszy” wariant, jeśli backend ma inną definicję
        fallback = f"{settings.BACKEND_BASE_URL}/api/listings/{listing_id}"
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                r = await client.get(primary)
                r.raise_for_status()
                return self._normalize_listing(r.json())
            except Exception:
                r = await client.get(fallback)
                r.raise_for_status()
                return self._normalize_listing(r.json())

    async def _get_categories(self) -> list[dict[str, Any]]:
        # Preferuj /api/categories/details jeśli zwraca id/nazwę; fallback na /api/categories/names
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                r = await client.get(f"{settings.BACKEND_BASE_URL}/api/categories/details")
                r.raise_for_status()
                data = r.json()
                if isinstance(data, list) and data:
                    return data
            except Exception:
                pass
            r = await client.get(f"{settings.BACKEND_BASE_URL}/api/categories/names")
            r.raise_for_status()
            names = r.json()
            # Gdy brak id w odpowiedzi, nie możemy stronicować po kategoriach — zwróć pustą listę
            if isinstance(names, list):
                return [c for c in names if isinstance(c, dict)]
            return []

    async def get_all_listings_backend(self) -> AsyncGenerator[dict[str, Any], None]:
        # Zgodnie z dokumentacją: GET /api/listings/category/:categoryId
        cats = await self._get_categories()
        if not cats:
            # Fallback: spróbuj ogólnej listy /api/listings?page&limit
            async with httpx.AsyncClient(timeout=30.0) as client:
                page = 1
                page_size = 500
                while True:
                    url_all = f"{settings.BACKEND_BASE_URL}/api/listings?page={page}&limit={page_size}"
                    try:
                        r_all = await client.get(url_all)
                        r_all.raise_for_status()
                    except httpx.HTTPStatusError as e:
                        break
                    items = r_all.json()
                    if isinstance(items, dict):
                        if "items" in items and isinstance(items["items"], list):
                            items = items["items"]
                        elif "data" in items and isinstance(items["data"], list):
                            items = items["data"]
                    if not isinstance(items, list) or not items:
                        break
                    for it in items:
                        yield self._normalize_listing(it)
                    page += 1
            return
        async with httpx.AsyncClient(timeout=30.0) as client:
            for cat in cats:
                category_id = cat.get("categoryId") or cat.get("id")
                if category_id is None:
                    continue
                url_cat = f"{settings.BACKEND_BASE_URL}/api/listings/category/{category_id}?page=1&limit=1000"
                try:
                    r = await client.get(url_cat)
                    r.raise_for_status()
                    items = r.json()
                except httpx.HTTPStatusError as e:
                    if e.response is not None and e.response.status_code == 404:
                        # Fallback: /api/listings?categoryId=...
                        url_alt = f"{settings.BACKEND_BASE_URL}/api/listings?categoryId={category_id}&page=1&limit=1000"
                        try:
                            r = await client.get(url_alt)
                            r.raise_for_status()
                            items = r.json()
                        except httpx.HTTPStatusError as e2:
                            if e2.response is not None and e2.response.status_code == 404:
                                continue
                            raise
                    else:
                        raise
                if isinstance(items, dict) and "items" in items and isinstance(items["items"], list):
                    items = items["items"]
                elif isinstance(items, dict) and "data" in items and isinstance(items["data"], list):
                    items = items["data"]
                if not isinstance(items, list):
                    continue
                for it in items:
                    yield self._normalize_listing(it)

    # --- Public API klasy ---
    async def get_listing_by_id(self, listing_id: int) -> dict[str, Any] | None:
        return await self.get_listing_by_id_backend(listing_id)

    async def iter_all_listings(self) -> AsyncGenerator[dict[str, Any], None]:
        async for it in self.get_all_listings_backend():
            yield it


