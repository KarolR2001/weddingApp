from typing import Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, Filter, FieldCondition, MatchValue
from app.config import settings
from app.logger import logger


class QdrantService:
    def __init__(self, url: str, collection: str, vector_size: int):
        self.client = QdrantClient(url=url)
        self.collection = collection
        self.vector_size = vector_size

    def ensure_collection(self) -> None:
        try:
            self.client.get_collection(self.collection)
            logger.info(f"Qdrant collection exists: {self.collection}")
        except Exception:
            logger.info(f"Creating Qdrant collection: {self.collection}")
            self.client.recreate_collection(
                collection_name=self.collection,
                vectors_config=VectorParams(size=self.vector_size, distance=Distance.COSINE),
            )

    def upsert_point(self, point_id: int | str, vector: list[float], payload: dict[str, Any]) -> None:
        self.client.upsert(
            collection_name=self.collection,
            points=[
                {"id": point_id, "vector": vector, "payload": payload}
            ],
        )

    def delete_point(self, point_id: int | str) -> None:
        self.client.delete(
            collection_name=self.collection,
            points_selector={"points": [point_id]}
        )

    def build_filter(self, *, city: Optional[str] = None, category: Optional[str] = None,
                     price_min: Optional[int] = None, price_max: Optional[int] = None) -> Optional[Filter]:
        must = []
        if city:
            must.append(FieldCondition(key="city", match=MatchValue(value=city)))
        if category:
            must.append(FieldCondition(key="category", match=MatchValue(value=category)))
        if not must:
            return None
        return Filter(must=must)

    def search(self, query_vector: list[float], *, limit: int = 10, qfilter: Optional[Filter] = None):
        return self.client.search(
            collection_name=self.collection,
            query_vector=query_vector,
            limit=limit,
            query_filter=qfilter
        )


_qdrant_service: Optional[QdrantService] = None


def get_qdrant() -> QdrantService:
    global _qdrant_service
    if _qdrant_service is None:
        _qdrant_service = QdrantService(
            url=settings.QDRANT_URL,
            collection=settings.QDRANT_COLLECTION,
            vector_size=settings.VECTOR_SIZE,
        )
        _qdrant_service.ensure_collection()
    return _qdrant_service


