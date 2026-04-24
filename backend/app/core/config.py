from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Clinical AI Portal"
    PROJECT_VERSION: str = "1.0.0"

    # CORS — add your Vercel frontend URL here
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://clin-sight-one.vercel.app",
    ]

    # Database — set DATABASE_URL env var on Render to a PostgreSQL connection string.
    # Falls back to SQLite for local development.
    DATABASE_URL: str = "sqlite:///./clinical_ai.db"

    # Security — ALWAYS override SECRET_KEY via env var in production!
    SECRET_KEY: str = "CHANGE_THIS_TO_A_SECURE_SECRET_KEY"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Gemini
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

