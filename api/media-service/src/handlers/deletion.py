"""
File deletion handler
"""

import logging
import os

from models import Image
from utils.auth import get_user_id_from_request
from utils.responses import respond_error, respond_success
from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)


def delete_file(filename):
    """Delete a file by filename"""
    try:
        logger.info(f"File deletion request for: {filename}")

        # Get user ID from request
        user_id = get_user_id_from_request()
        if not user_id:
            return respond_error("Authentication required", 401)

        # Secure the filename
        safe_filename = secure_filename(filename)

        # Find the image in database
        image_record = Image.get_by_filename(safe_filename)
        if not image_record:
            logger.warning(f"File not found in database: {filename}")
            return respond_error("File not found", 404)

        # Check if user owns this file
        if image_record.user_id != user_id:
            logger.warning(
                f"User {user_id} attempted to delete file owned by "
                f"user {image_record.user_id}"
            )
            return respond_error(
                "Access denied: you can only delete your own files", 403
            )

        # Soft delete in database
        image_record.soft_delete()

        # Delete physical file
        try:
            if os.path.exists(image_record.file_path):
                os.remove(image_record.file_path)
                logger.info(f"Physical file deleted: {image_record.file_path}")
        except Exception as e:
            logger.warning(
                f"Could not delete physical file {image_record.file_path}: {e}"
            )

        logger.info(f"File deleted successfully: {filename} for user {user_id}")
        return respond_success(
            {"id": image_record.id, "filename": filename},
            "File deleted successfully",
        )

    except Exception as e:
        logger.error(f"File deletion error: {str(e)}")
        return respond_error("Internal server error during file deletion", 500)
