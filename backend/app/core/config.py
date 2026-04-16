from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Clinical AI Portal"
    PROJECT_VERSION: str = "1.0.0"
    
    # In production, this should be set to the frontend domain
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "*"]
    
    # Database
    DATABASE_URL: str = "sqlite:///./clinical_ai.db" # Defaulting to SQLite for dev ease-of-use as per request implies "no overengineering" initially for local setup
    
    # Security
    SECRET_KEY: str = "CHANGE_THIS_TO_A_SECURE_SECRET_KEY"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        case_sensitive = True

settings = Settings()
