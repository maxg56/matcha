"""
File retrieval handler
"""

import logging
import os

from flask import send_file
from models import Image
from utils.responses import respond_error
from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)


def get_file(filename):
    """Retrieve a file by filename"""
    try:
        logger.info(f"File retrieval request for: {filename}")

        # Secure the filename
        safe_filename = secure_filename(filename)

        # Check if file exists in database
        image_record = Image.get_by_filename(safe_filename)
        if not image_record:
            logger.warning(f"File not found in database: {filename}")
            return respond_error("File not found", 404)

        # Check if physical file exists
        if not os.path.exists(image_record.file_path):
            logger.warning(f"Physical file not found: {image_record.file_path}")
            return respond_error("File not found on disk", 404)

        logger.info(
            f"File served successfully: {filename} " f"for user {image_record.user_id}"
        )
        return send_file(image_record.file_path, mimetype=image_record.mime_type)

    except Exception as e:
        logger.error(f"File retrieval error: {str(e)}")
        return respond_error("Internal server error during file retrieval", 500)
