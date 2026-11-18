import os
import secrets
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

IS_VERCEL = bool(os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"))

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY") or secrets.token_hex(32)
    
    if IS_VERCEL:
        DATABASE_PATH = os.getenv("DATABASE_PATH", "/tmp/learning_agent.db")
    else:
        DATABASE_PATH = os.getenv("DATABASE_PATH", str(BASE_DIR / "database" / "learning_agent.db"))

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
    SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY", "").strip()
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://127.0.0.1:5001").split(",")
    PORT = int(os.getenv("PORT", "5001"))
    DEBUG = os.getenv("FLASK_ENV", "development") == "development"
    
    @classmethod
    def has_gemini_key(cls) -> bool:
        return bool(cls.GEMINI_API_KEY and not cls.GEMINI_API_KEY.startswith("your_"))

    @classmethod
    def has_openai_key(cls) -> bool:
        return bool(cls.OPENAI_API_KEY and not cls.OPENAI_API_KEY.startswith("your_"))
        
    @classmethod
    def has_serpapi_key(cls) -> bool:
        return bool(cls.SERPAPI_API_KEY and not cls.SERPAPI_API_KEY.startswith("your_"))