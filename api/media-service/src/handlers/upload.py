"""
File upload handler
"""
import os
import logging
from flask import request, current_app
from utils.responses import respond_success, respond_error
from utils.file_utils import allowed_file, generate_unique_filename

logger = logging.getLogger(__name__)


def upload_file():
    """Upload a file and return its URL"""
    try:
        logger.info("File upload request received")
        
        # Check if file is in request
        if "file" not in request.files:
            logger.warning("No file part in request")
            return respond_error("No file part in request", 400)
        
        file = request.files["file"]
        
        # Check if file was selected
        if file.filename == "":
            logger.warning("No file selected")
            return respond_error("No file selected", 400)
        
        # Check file type
        if not allowed_file(file.filename):
            logger.warning(f"File type not allowed: {file.filename}")
            return respond_error("File type not allowed. Allowed types: png, jpg, jpeg, gif, webp", 400)
        
        # Generate unique filename
        unique_filename = generate_unique_filename(file.filename)
        if not unique_filename:
            logger.error("Failed to generate unique filename")
            return respond_error("Failed to process filename", 500)
        
        # Save file
        file_path = os.path.join(current_app.config["UPLOAD_FOLDER"], unique_filename)
        file.save(file_path)
        
        # Generate public URL
        base_url = request.host_url.rstrip("/")
        file_url = f"{base_url}/api/v1/media/get/{unique_filename}"
        
        logger.info(f"File uploaded successfully: {unique_filename}")
        return respond_success({
            "filename": unique_filename,
            "url": file_url,
            "original_name": file.filename
        }, "File uploaded successfully")
        
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        return respond_error("Internal server error during upload", 500)