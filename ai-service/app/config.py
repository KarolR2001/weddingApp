from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    OPENAI_API_KEY: str | None = Field(default=None)
    INTERNAL_TOKEN: str = Field(default="dev-internal-token-CHANGE_ME")

    QDRANT_URL: str = Field(default="http://qdrant:6333")
    QDRANT_COLLECTION: str = Field(default="wedding_listings_v1")

    EMBEDDING_MODEL: str = Field(default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
    VECTOR_SIZE: int = Field(default=384)
    EMBEDDING_BATCH: int = Field(default=32)

    APP_HOST: str = Field(default="0.0.0.0")
    APP_PORT: int = Field(default=8000)
    DEBUG: bool = Field(default=True)

    # Źródło danych (Etap 3)
    DATA_SOURCE: str = Field(default="backend")
    BACKEND_BASE_URL: str = Field(default="http://host.docker.internal:5000")

    # Etap 5 – OpenAI
    OPENAI_CHAT_MODEL: str = Field(default="gpt-4o-mini")
    OPENAI_MAX_TOKENS: int = Field(default=600)
    OPENAI_TEMPERATURE: float = Field(default=0.2)

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()


