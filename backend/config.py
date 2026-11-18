import os
import sys
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

# Detect Vercel / AWS Lambda read-only environment
IS_VERCEL = bool(os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"))

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-learning-agent-key-2026")
    
    # On Vercel, use /tmp which is the only writable directory
    if IS_VERCEL:
        DATABASE_PATH = os.getenv("DATABASE_PATH", "/tmp/learning_agent.db")
    else:
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
