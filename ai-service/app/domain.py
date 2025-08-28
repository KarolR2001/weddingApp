from typing import Any


def build_listing_text_for_embedding(listing: dict[str, Any]) -> str:
    """
    Skleja treść do embeddingu z atrybutów oferty.
    Oczekiwane pola: title, longDescription, category, city, priceMin, priceMax, features, rating (opcjonalnie).
    """
    title = listing.get("title") or ""
    desc = listing.get("longDescription") or ""
    cat = listing.get("category") or ""
    city = listing.get("city") or ""
    pmin = listing.get("priceMin")
    pmax = listing.get("priceMax")
    rating = listing.get("rating")
    features = listing.get("features")

    price_part = ""
    if pmin is not None or pmax is not None:
        price_part = f"Cena: {pmin or ''}-{pmax or ''} PLN."

    rating_part = f"Ocena: {rating}/5." if rating is not None else ""

    features_part = ""
    if isinstance(features, (list, tuple)):
        features_part = "Cechy: " + ", ".join(map(str, features)) + "."
    elif isinstance(features, str):
        features_part = f"Cechy: {features}."

    return (
        f"Tytuł: {title}. "
        f"Kategoria: {cat}. "
        f"Miasto: {city}. "
        f"{price_part} "
        f"{rating_part} "
        f"Opis: {desc}. "
        f"{features_part}"
    ).strip()


