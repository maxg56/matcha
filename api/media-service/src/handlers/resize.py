"""
Image resize handler
"""

import logging
import os

from config.settings import IMAGE_QUALITY, MAX_IMAGE_DIMENSION
from flask import current_app, request
from models import Image, db
from PIL import Image as PILImage
from utils.auth import get_user_id_from_request
from utils.responses import respond_error, respond_success
from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)


def resize_image():
    """Resize an image and return the resized version URL"""
    try:
        logger.info("Image resize request received")

        # Get user ID from request
        user_id = get_user_id_from_request()
        if not user_id:
            return respond_error("Authentication required", 401)

        data = request.get_json()
        if not data:
            return respond_error("JSON data required", 400)

        filename = data.get("filename")
        width = data.get("width")
        height = data.get("height")

        # Validate required fields
        if not filename:
            return respond_error("Filename is required", 400)

        if not width or not height:
            return respond_error("Width and height are required", 400)

        try:
            width = int(width)
            height = int(height)
        except (ValueError, TypeError):
            return respond_error("Width and height must be valid integers", 400)

        if width <= 0 or height <= 0:
            return respond_error("Width and height must be positive integers", 400)

        if width > MAX_IMAGE_DIMENSION or height > MAX_IMAGE_DIMENSION:
            return respond_error(
                f"Width and height cannot exceed {MAX_IMAGE_DIMENSION} pixels",
                400,
            )

        # Secure the filename and find in database
        safe_filename = secure_filename(filename)
        original_image = Image.get_by_filename(safe_filename)

        if not original_image:
            logger.warning(f"File not found in database: {filename}")
            return respond_error("File not found", 404)

        # Check if user owns this file
        if original_image.user_id != user_id:
            logger.warning(
                f"User {user_id} attempted to resize file owned by "
                f"user {original_image.user_id}"
            )
            return respond_error(
                "Access denied: you can only resize your own files", 403
            )

        # Check if physical file exists
        if not os.path.exists(original_image.file_path):
            logger.warning(f"Physical file not found: {original_image.file_path}")
            return respond_error("File not found on disk", 404)

        # Generate new filename for resized image
        name, ext = os.path.splitext(safe_filename)
        resized_filename = f"{name}_resized_{width}x{height}{ext}"
        resized_path = os.path.join(
            current_app.config["UPLOAD_FOLDER"], resized_filename
        )

        # Open and resize image
        with PILImage.open(original_image.file_path) as img:
            resized_img = img.resize((width, height), PILImage.Resampling.LANCZOS)
            resized_img.save(resized_path, optimize=True, quality=IMAGE_QUALITY)

        # Get file size of resized image
        resized_file_size = os.path.getsize(resized_path)

        # Create database record for resized image
        resized_image = Image(
            user_id=user_id,
            filename=resized_filename,
            original_name=f"resized_{original_image.original_name}",
            file_path=resized_path,
            file_size=resized_file_size,
            mime_type=original_image.mime_type,
            width=width,
            height=height,
            description=f"Resized from {original_image.filename}",
        )

        db.session.add(resized_image)
        db.session.commit()

        # Generate public URL
        base_url = request.host_url.rstrip("/")
        resized_url = f"{base_url}/api/v1/media/get/{resized_filename}"

        logger.info(
            f"Image resized successfully: {filename} -> {resized_filename} "
            f"for user {user_id}"
        )
        return respond_success(
            {
                "id": resized_image.id,
                "original_filename": filename,
                "original_id": original_image.id,
                "resized_filename": resized_filename,
                "url": resized_url,
                "width": width,
                "height": height,
                "file_size": resized_file_size,
            },
            "Image resized successfully",
        )

    except Exception as e:
        logger.error(f"Image resize error: {str(e)}")
        # Cleanup resized file if database save failed
        if "resized_path" in locals() and os.path.exists(resized_path):
            try:
                os.remove(resized_path)
            except Exception:
                pass
        return respond_error("Internal server error during image resizing", 500)
