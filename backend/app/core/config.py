from functools import lru_cache
from pathlib import Path
from typing import Annotated, Any

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Environment-backed application settings.

    Secrets intentionally have empty defaults so importing the app and running
    unit tests never requires committing credentials.
    """

    openai_api_key: str = ""
    openai_model: str = ""
    supabase_url: str = ""
    supabase_publishable_key: str = ""
    supabase_anon_key: str = ""
    allowed_origins: Annotated[list[str], NoDecode] = Field(default_factory=list)
    environment: str = "development"
    max_image_size_mb: int = Field(default=5, ge=1, le=20)

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_allowed_origins(cls, value: Any) -> list[str]:
        if value in (None, ""):
            return []
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return list(value)

    @property
    def supabase_public_key(self) -> str:
        """Prefer modern publishable keys while retaining anon-key compatibility."""

        return self.supabase_publishable_key or self.supabase_anon_key


@lru_cache
def get_settings() -> Settings:
    return Settings()
