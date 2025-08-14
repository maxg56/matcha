"""
File deletion handler
"""
import os
import logging
from flask import current_app
from werkzeug.utils import secure_filename
from utils.responses import respond_success, respond_error

logger = logging.getLogger(__name__)


def delete_file(filename):
    """Delete a file by filename"""
    try:
        logger.info(f"File deletion request for: {filename}")
        
        # Secure the filename
        safe_filename = secure_filename(filename)
        file_path = os.path.join(current_app.config["UPLOAD_FOLDER"], safe_filename)
        
        # Check if file exists
        if not os.path.exists(file_path):
            logger.warning(f"File not found for deletion: {filename}")
            return respond_error("File not found", 404)
        
        # Delete the file
        os.remove(file_path)
        
        logger.info(f"File deleted successfully: {filename}")
        return respond_success({"filename": filename}, "File deleted successfully")
        
    except Exception as e:
        logger.error(f"File deletion error: {str(e)}")
        return respond_error("Internal server error during file deletion", 500)