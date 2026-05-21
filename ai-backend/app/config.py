import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "XR Astra Backend Core"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # AI API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Spatial DB Keys (Simulated as local json database files)
    QDRANT_HOST: str = os.getenv("QDRANT_HOST", "localhost")
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    
    class Config:
        env_file = ".env"

settings = Settings()
