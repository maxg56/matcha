from flask import Flask
from flask_cors import CORS
from app.config import init_db

def create_app():
    """Application factory for creating Flask app"""
    app = Flask(__name__)
    
    # Enable CORS
    CORS(app)
    
    # Initialize database
    init_db(app)
    
    # Register blueprints
    from app.routes import health_bp
    from app.routes import matches_bp
    from app.routes import matrix_bp
    
    app.register_blueprint(health_bp)
    app.register_blueprint(matches_bp)
    app.register_blueprint(matrix_bp)
    
    return app