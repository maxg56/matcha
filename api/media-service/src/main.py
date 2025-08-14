"""
Media Service - Service de gestion des médias pour Matcha

Fournit les fonctionnalités d'upload, récupération, suppression et redimensionnement d'images.
"""
import logging
from pathlib import Path
from flask import Flask
from flask_cors import CORS

# Import configuration
from config.settings import UPLOAD_FOLDER, MAX_CONTENT_LENGTH, get_port, get_debug_mode

# Import handlers
from handlers.health import health_check
from handlers.upload import upload_file
from handlers.retrieval import get_file
from handlers.deletion import delete_file
from handlers.resize import resize_image

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure app settings
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH


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


if __name__ == "__main__":
    # Create upload directory if it doesn't exist
    upload_path = Path(UPLOAD_FOLDER)
    upload_path.mkdir(exist_ok=True)
    
    port = get_port()
    debug_mode = get_debug_mode()
    
    logger.info(f"Starting media service on port {port}")
    logger.info(f"Upload directory: {upload_path.absolute()}")
    logger.info(f"Debug mode: {debug_mode}")
    
    app.run(host="0.0.0.0", port=port, debug=debug_mode)