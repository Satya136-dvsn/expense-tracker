from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: str = "postgresql://ai_user:ai_password@localhost:5433/ai_insights"
    redis_url: str = "redis://localhost:6380"
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    budgetwise_api_url: str = "http://localhost:8080/api"
    
    class Config:
        env_file = ".env"

settings = Settings()