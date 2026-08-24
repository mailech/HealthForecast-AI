from typing import List, Union

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # -----------------------------
    # Application Settings
    # -----------------------------
    PROJECT_NAME: str = "HealthForecast AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    # -----------------------------
    # JWT Settings
    # -----------------------------
    SECRET_KEY: str = Field(
        default="HealthForecastAI2026SuperSecureJWTSecretKey123456",
        alias="SECRET_KEY"
    )

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 Days

    # -----------------------------
    # PostgreSQL Database Settings
    # -----------------------------
    POSTGRES_SERVER: str = Field(
        default="localhost",
        alias="POSTGRES_SERVER"
    )

    # PostgreSQL is running on 5432
    POSTGRES_PORT: str = Field(
        default="5432",
        alias="POSTGRES_PORT"
    )

    POSTGRES_USER: str = Field(
        default="postgres",
        alias="POSTGRES_USER"
    )

    POSTGRES_PASSWORD: str = Field(
        default="postgres123",
        alias="POSTGRES_PASSWORD"
    )

    POSTGRES_DB: str = Field(
        default="healthforecast_db",
        alias="POSTGRES_DB"
    )

    SQLALCHEMY_DATABASE_URI: Union[str, None] = None

    # -----------------------------
    # Build Database Connection URL
    # -----------------------------
    @field_validator("SQLALCHEMY_DATABASE_URI", mode="before")
    @classmethod
    def assemble_db_connection(
        cls,
        v: Union[str, None],
        info
    ) -> str:

        # If DATABASE URL is already provided, use it
        if isinstance(v, str) and v.strip():
            return v

        values = info.data

        user = values.get("POSTGRES_USER", "postgres")
        password = values.get("POSTGRES_PASSWORD", "postgres123")
        server = values.get("POSTGRES_SERVER", "localhost")
        port = values.get("POSTGRES_PORT", "5432")
        database = values.get("POSTGRES_DB", "healthforecast_db")

        return (
            f"postgresql+asyncpg://"
            f"{user}:{password}"
            f"@{server}:{port}/{database}"
        )

    # -----------------------------
    # Database URL Property
    # -----------------------------
    @property
    def DATABASE_URL(self) -> str:
        return self.SQLALCHEMY_DATABASE_URI or ""

    # -----------------------------
    # CORS Settings
    # -----------------------------
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    # -----------------------------
    # Environment Configuration
    # -----------------------------
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


# Create settings object
settings = Settings()