import sys
import os
from pathlib import Path
import importlib.util

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_dir))

# Force Vercel environment flag
os.environ["VERCEL"] = "1"

# Load backend/app.py without circular import collision
spec = importlib.util.spec_from_file_location("backend_app", backend_dir / "app.py")
backend_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(backend_module)

app = backend_module.app
