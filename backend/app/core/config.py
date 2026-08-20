from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "VeriRule API"
    app_version: str = "0.1.0"
    environment: str = "development"
    api_prefix: str = ""
    allowed_origins: str = "http://localhost:3000"
    database_url: str = "sqlite:///./data/verirule.db"
    upload_directory: str = "./data/uploads"
    chroma_directory: str = "./data/chroma"
    chroma_collection: str = "verirule_documents"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
