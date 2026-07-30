import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, Union

class Settings(BaseSettings):
    PROJECT_NAME: str = "SocialPilot API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "socialpilot_super_secret_jwt_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # PostgreSQL Configuration Defaults
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "socialpilot"
    POSTGRES_PORT: int = 5432

    # Database URL override (SQLite or PostgreSQL)
    DATABASE_URL: Optional[str] = None

    # MongoDB Configuration
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "socialpilot"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()
if not settings.DATABASE_URL:
    settings.DATABASE_URL = settings.get_database_url()
