import os
import sys
from pathlib import Path
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

# Add backend directory to sys.path
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

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend Vite dev server & production builds
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Ensure database tables exist safely
    try:
        init_db()
    except Exception as e:
        print(f"Warning during init_db: {e}")

    # Register API blueprints
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
            'openai_configured': Config.has_openai_key(),
            'serpapi_configured': Config.has_serpapi_key(),
            'environment': os.getenv('FLASK_ENV', 'development')
        })

    # Serve built frontend for direct visits
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
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
    print(f"🚀 LearnPath AI Backend starting on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=Config.DEBUG)
