import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ENV: str = "development"
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/knowledgeos"
    
    # LLM Abstraction
    # Values: "gemini" | "openai" | "ollama"
    LLM_PROVIDER: str = "gemini"
    
    # Credentials
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    
    # Ollama
    OLLAMA_BASE_URL: str = "http://host.docker.internal:11434"
    OLLAMA_MODEL: str = "llama3"
    
    # Embeddings
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    
    # File Storage
    UPLOAD_DIR: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "storage",
        "documents"
    )

    model_config = SettingsConfigDict(
        env_file=os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
            ".env"
        ),
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Instantiate settings
settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
