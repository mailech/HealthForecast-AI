import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "HealthForecast AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = "super-secret-key-change-in-production-healthforecast-2026-btech"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database Settings (Default fallback to async SQLite for local execution/testing, configurable for PostgreSQL)
    DATABASE_URL: str = "sqlite+aiosqlite:///./healthforecast.db"
    
    # Dataset Path (4 parent dir levels from app/core/config.py to reach workspace root)
    DATASET_PATH: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))),
        "dataset",
        "diabetic_data.csv"
    )
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]
    
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
