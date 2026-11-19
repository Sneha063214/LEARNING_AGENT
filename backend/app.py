import os
import sys
import time
from collections import defaultdict
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

sys.path.insert(0, str(Path(__file__).resolve().parent))

from config import Config
from database.db import init_db
from routes.auth import auth_bp
from routes.subjects import subjects_bp
from routes.assessment import assessment_bp
from routes.roadmap import roadmap_bp
from routes.gap import gap_bp
from routes.tutor import tutor_bp
from routes.analytics import analytics_bp
from routes.resources import resources_bp

# Lightweight sliding-window rate limiter store
_RATE_LIMIT_STORE = defaultdict(list)
RATE_LIMIT_MAX_REQUESTS = 120
RATE_LIMIT_WINDOW_SECONDS = 60

def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    # Restricted CORS policy with explicit origins
    CORS(app, resources={r"/api/*": {"origins": Config.ALLOWED_ORIGINS}})

    try:
        init_db()
    except Exception as e:
        print(f"Warning during init_db: {e}")

    @app.before_request
    def enforce_rate_limit():
        if app.config.get("TESTING"):
            return None
        client_ip = request.remote_addr or "127.0.0.1"
        now = time.time()
        window_start = now - RATE_LIMIT_WINDOW_SECONDS
        if len(_RATE_LIMIT_STORE) > 2000:
            stale_ips = [ip for ip, stamps in _RATE_LIMIT_STORE.items() if not stamps or stamps[-1] <= window_start]
            for ip in stale_ips:
                del _RATE_LIMIT_STORE[ip]
        requests_in_window = [ts for ts in _RATE_LIMIT_STORE[client_ip] if ts > window_start]
        if len(requests_in_window) >= RATE_LIMIT_MAX_REQUESTS:
            return jsonify({"error": "Rate limit exceeded. Please retry shortly."}), 429
        requests_in_window.append(now)
        _RATE_LIMIT_STORE[client_ip] = requests_in_window
        return None

    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' http://localhost:5001 http://127.0.0.1:5001;"
        )
        return response

    app.register_blueprint(auth_bp)
    app.register_blueprint(subjects_bp)
    app.register_blueprint(assessment_bp)
    app.register_blueprint(roadmap_bp)
    app.register_blueprint(gap_bp)
    app.register_blueprint(tutor_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(resources_bp)

    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'gemini_configured': Config.has_gemini_key(),
            'openai_configured': Config.has_openai_key(),
            'serpapi_configured': Config.has_serpapi_key(),
            'environment': os.getenv('FLASK_ENV', 'development'),
            'hackathon': 'PromptWars x AgentX 2.0 (Hack2skill)'
        })

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path: str):
        if path.startswith('api/'):
            return jsonify({'error': 'API endpoint not found'}), 404
        
        static_dir = Path(__file__).resolve().parent.parent / 'frontend' / 'dist'
        if not static_dir.exists():
            static_dir = Path(__file__).resolve().parent / 'static'
            
        if (static_dir / path).exists() and path != '':
            return send_from_directory(static_dir, path)
        if (static_dir / 'index.html').exists():
            return send_from_directory(static_dir, 'index.html')
            
        return jsonify({
            'status': 'LearnPath AI API is running',
            'health': '/api/health'
        })

    return app

app = create_app()

if __name__ == '__main__':
    port = Config.PORT
    host = os.getenv('FLASK_RUN_HOST', '127.0.0.1')
    print(f"LearnPath AI Backend starting on http://{host}:{port}")
    app.run(host=host, port=port, debug=Config.DEBUG)