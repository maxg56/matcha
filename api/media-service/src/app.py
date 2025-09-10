"""
Flask application factory
"""

import logging
import os
from pathlib import Path

from config.database import create_tables, init_database

# Import configuration
from config.settings import MAX_CONTENT_LENGTH, UPLOAD_FOLDER, get_database_url
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from handlers.deletion import delete_file

# Import handlers
from handlers.health import health_check
from handlers.resize import resize_image
from handlers.retrieval import get_file
from handlers.upload import upload_file
from handlers.user_media import get_user_media, list_user_media, set_profile_image

# Import models
from models import Image, db

logger = logging.getLogger(__name__)


def create_app(config=None):
    """Application factory"""
    # Load environment variables
    load_dotenv()

    # Configure logging
    logging.basicConfig(level=logging.INFO)

    # Initialize Flask app
    app = Flask(__name__)
    CORS(app)

    # Configure app settings
    app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
    app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

    # Apply custom config if provided (for testing)
    if config:
        app.config.update(config)
    else:
        # Initialize database for production
        init_database(app)

    # Initialize database
    db.init_app(app)

    # Register routes
    @app.route("/health", methods=["GET"])
    def health():
        return health_check()

    @app.route("/api/v1/media/upload", methods=["POST"])
    def upload():
        return upload_file()

    @app.route("/api/v1/media/get/<filename>", methods=["GET"])
    def get(filename):
        return get_file(filename)

    @app.route("/api/v1/media/delete/<filename>", methods=["DELETE"])
    def delete(filename):
        return delete_file(filename)

    @app.route("/api/v1/media/resize", methods=["POST"])
    def resize():
        return resize_image()

    @app.route("/api/v1/media/my", methods=["GET"])
    def my_media():
        return list_user_media()

    @app.route("/api/v1/media/user/<user_id>", methods=["GET"])
    def user_media(user_id):
        return get_user_media(user_id)

    @app.route("/api/v1/media/profile", methods=["POST"])
    def profile():
        return set_profile_image()

    @app.route("/api/v1/media/uploads/<filename>", methods=["GET"])
    def serve_upload(filename):
        """Serve uploaded files directly from uploads folder"""
        import os
        import logging
        from flask import send_from_directory, abort
        from werkzeug.utils import secure_filename
        from config.settings import UPLOAD_FOLDER
        
        logger = logging.getLogger(__name__)
        logger.info(f"=== SERVING UPLOAD REQUEST FOR: {filename} ===")
        
        # Secure the filename to prevent directory traversal
        safe_filename = secure_filename(filename)
        file_path = os.path.join(UPLOAD_FOLDER, safe_filename)
        
        logger.info(f"Upload folder: {UPLOAD_FOLDER}")
        logger.info(f"Safe filename: {safe_filename}")
        logger.info(f"Full file path: {file_path}")
        logger.info(f"File exists: {os.path.exists(file_path)}")
        
        # List files in upload directory for debugging
        if os.path.exists(UPLOAD_FOLDER):
            files = os.listdir(UPLOAD_FOLDER)
            logger.info(f"Files in upload folder: {files}")
        
        # Check if file exists
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            abort(404)
            
        logger.info(f"Serving file: {file_path}")
        return send_from_directory(UPLOAD_FOLDER, safe_filename)
    

    return app
