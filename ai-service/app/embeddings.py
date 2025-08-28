from functools import lru_cache
from sentence_transformers import SentenceTransformer
from app.config import settings
from app.logger import logger


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    logger.info(f"Loading embedding model (CPU): {settings.EMBEDDING_MODEL}")
    # Wymuś CPU, aby uniknąć problemów z meta tensor / CUDA w kontenerze
    model = SentenceTransformer(settings.EMBEDDING_MODEL, device="cpu")
    return model


def embed_text(text: str) -> list[float]:
    model = get_model()
    vec = model.encode([text], normalize_embeddings=True)[0].tolist()
    if len(vec) != settings.VECTOR_SIZE:
        logger.warning(f"VECTOR_SIZE mismatch: expected {settings.VECTOR_SIZE}, got {len(vec)}")
    return vec


def embed_texts(texts: list[str]) -> list[list[float]]:
    model = get_model()
    vecs = model.encode(texts, normalize_embeddings=True)
    return [v.tolist() for v in vecs]


