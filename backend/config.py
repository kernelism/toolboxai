import os
from typing import Optional

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MODEL_BACKEND: str = "together_ai"
    API_KEY: Optional[str] = None
    MODEL: Optional[str] = None
    API_URL: Optional[str] = None
    LOCAL_MODEL_NAME: Optional[str] = None
    OLLAMA_API_URL: Optional[str] = None

    class Config:
        env_file = f'.env'
        extra = "ignore"

settings = Settings()