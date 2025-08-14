"""
Media Service - Service de gestion des médias pour Matcha

Fournit les fonctionnalités d'upload, récupération, suppression et redimensionnement d'images.
"""

import logging
from pathlib import Path

from app import create_app
from config.database import create_tables, test_connection
from config.settings import UPLOAD_FOLDER, get_debug_mode, get_port
from models import db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the Flask app
app = create_app()


if __name__ == "__main__":
    # Create upload directory if it doesn't exist
    upload_path = Path(UPLOAD_FOLDER)
    upload_path.mkdir(exist_ok=True)

    port = get_port()
    debug_mode = get_debug_mode()

    logger.info(f"Starting media service on port {port}")
    logger.info(f"Upload directory: {upload_path.absolute()}")
    logger.info(f"Debug mode: {debug_mode}")

    # Test database connection
    if not test_connection():
        logger.error("Failed to connect to database. Exiting...")
        exit(1)

    # Create tables within application context
    with app.app_context():
        try:
            create_tables(db)
            logger.info("Database tables initialized")
        except Exception as e:
            logger.error(f"Failed to initialize database tables: {e}")
            exit(1)

    app.run(host="0.0.0.0", port=port, debug=debug_mode)
