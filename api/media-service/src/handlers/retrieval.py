"""
File retrieval handler
"""
import os
import logging
from flask import send_file, current_app
from werkzeug.utils import secure_filename
from utils.responses import respond_error

logger = logging.getLogger(__name__)


def get_file(filename):
    """Retrieve a file by filename"""
    try:
        logger.info(f"File retrieval request for: {filename}")
        
        # Secure the filename
        safe_filename = secure_filename(filename)
        file_path = os.path.join(current_app.config["UPLOAD_FOLDER"], safe_filename)
        
        # Check if file exists
        if not os.path.exists(file_path):
            logger.warning(f"File not found: {filename}")
            return respond_error("File not found", 404)
        
        logger.info(f"File served successfully: {filename}")
        return send_file(file_path)
        
    except Exception as e:
        logger.error(f"File retrieval error: {str(e)}")
        return respond_error("Internal server error during file retrieval", 500)