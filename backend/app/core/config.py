"""
Centralized application configuration.
All environment-dependent values are read from environment variables (via .env
in local dev, real env vars in Docker/cloud). Never hardcode secrets here.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- App ---
    APP_NAME: str = "HealthForecast AI"
    ENVIRONMENT: str = "development"  # development | staging | production
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = True

    # --- Database ---
    # Defaults to a local SQLite file so the app runs with zero setup in
    # VS Code / a plain venv. docker-compose.yml overrides this with a real
    # Postgres URL for the containerized stack.
    DATABASE_URL: str = "sqlite:///./dev.db"

    # --- Auth / JWT ---
    SECRET_KEY: str = "change-this-in-production-use-a-real-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- CORS ---
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # --- ML ---
    MODEL_DIR: str = "app/ml/artifacts"
    READMISSION_MODEL_NAME: str = "readmission_xgb.joblib"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
