import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-learning-agent-key-2026")
    DATABASE_PATH = os.getenv("DATABASE_PATH", str(BASE_DIR / "database" / "learning_agent.db"))
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
    SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY", "").strip()
    PORT = int(os.getenv("PORT", "5001"))
    DEBUG = os.getenv("FLASK_ENV", "development") == "development"
    
    @classmethod
    def has_openai_key(cls):
        return bool(cls.OPENAI_API_KEY and not cls.OPENAI_API_KEY.startswith("your_"))
        
    @classmethod
    def has_serpapi_key(cls):
        return bool(cls.SERPAPI_API_KEY and not cls.SERPAPI_API_KEY.startswith("your_"))
