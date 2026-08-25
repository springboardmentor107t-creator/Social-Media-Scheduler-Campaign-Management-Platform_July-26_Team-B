from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SocialPilot API"
    API_V1_STR: str = "/api/v1"

    # Security
    # Set a strong SECRET_KEY in the production .env file.
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database Configuration (Defaults to local SQLite if PostgreSQL is not specified in .env)
    DATABASE_URL: str = "sqlite:///./socialpilot.db"

    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017/"
    MONGODB_DB_NAME: str = "socialpilot_db"

    model_config = SettingsConfigDict(
        env_file=[".env", "backend/.env"],
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()