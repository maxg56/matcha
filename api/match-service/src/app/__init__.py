from flask import Flask
from flask_cors import CORS
from app.config import init_db
from app.core.config import settings
from app.core.cache import init_cache
from app.core.logging import setup_logging
from app.core.security import init_security, security_middleware

def create_app():
    """Application factory for creating Flask app"""
    app = Flask(__name__)
    
    # Setup logging
    logger = setup_logging("match-service")
    
    # Enable CORS
    CORS(app, origins=settings.allowed_origins_list)
    
    # Initialize core components
    init_db(app)
    init_cache(app)
    init_security(app)
    
    # Initialize security middleware
    security_middleware.init_app(app)
    
    # Register blueprints
    from app.routes import health_bp
    from app.routes import matches_bp
    from app.routes import matrix_bp
    
    app.register_blueprint(health_bp)
    app.register_blueprint(matches_bp)
    app.register_blueprint(matrix_bp)
    
    logger.info(f"Match service started - Version: {settings.APP_VERSION}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info(f"Database: {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}")
    
    return app