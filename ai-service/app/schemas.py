from typing import Any, Optional
from pydantic import BaseModel, Field


class ListingPayload(BaseModel):
    id: int
    title: str
    longDescription: Optional[str] = None
    category: str
    city: str
    priceMin: Optional[int] = None
    priceMax: Optional[int] = None
    rating: Optional[float] = None
    features: Optional[list[str] | str] = None
    url: Optional[str] = None
    vendorId: Optional[int] = None
    reviewsCount: Optional[int] = None
    offersNationwideService: Optional[bool] = None


class UpdateEmbeddingRequest(BaseModel):
    listingId: Optional[int] = Field(default=None, description="ID oferty do pobrania ze źródła danych")
    listing: Optional[ListingPayload] = Field(default=None, description="Pełny payload oferty (gdy nie chcesz pobierać)")


class UpdateEmbeddingResponse(BaseModel):
    updated: bool
    id: int
    vector_len: int
    payload_keys: list[str]


class RemoveEmbeddingResponse(BaseModel):
    removed: bool
    id: int


class ReindexAllRequest(BaseModel):
    limit: Optional[int] = Field(default=None, description="Ogranicz reindeks do N ofert (do testów)")
    batch: int = Field(default=64, description="Wielkość batcha do embedowania")


class ReindexAllResponse(BaseModel):
    indexed: int
    skipped: int


