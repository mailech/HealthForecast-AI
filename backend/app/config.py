from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "HealthForecast AI"
    secret_key: str = "healthforecast-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480

    postgres_user: str = "healthforecast"
    postgres_password: str = "healthforecast123"
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "healthforecast_db"

    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db: str = "healthforecast_analytics"

    dataset_path: str = "data/diabetic_data.csv"
    ml_model_dir: str = "models"
    use_sqlite: bool = False

    @property
    def database_url(self) -> str:
        if self.use_sqlite:
            return "sqlite:///./healthforecast.db"
        return (
            f"postgresql://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
