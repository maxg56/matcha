"""
File upload handler
"""

import logging
import os

from flask import current_app, request
from models import Image, db
from PIL import Image as PILImage
from utils.auth import get_user_id_from_request
from utils.file_utils import allowed_file, generate_unique_filename
from utils.responses import respond_error, respond_success

logger = logging.getLogger(__name__)


def upload_file():
    """Upload a file and return its URL"""
    try:
        logger.info("File upload request received")

        # Get user ID from request
        user_id = get_user_id_from_request()
        if not user_id:
            return respond_error("Authentication required", 401)

        # Check if file is in request (accept both 'image' and 'file' for compatibility)
        if "image" not in request.files and "file" not in request.files:
            logger.warning("No file part in request")
            return respond_error("No file part in request", 400)

        file = request.files.get("image") or request.files.get("file")

        # Check if file was selected
        if file.filename == "":
            logger.warning("No file selected")
            return respond_error("No file selected", 400)

        # Check file type
        if not allowed_file(file.filename):
            logger.warning(f"File type not allowed: {file.filename}")
            return respond_error(
                "File type not allowed. Allowed types: png, jpg, jpeg, gif, " "webp",
                400,
            )

        # Generate unique filename
        unique_filename = generate_unique_filename(file.filename)
        if not unique_filename:
            logger.error("Failed to generate unique filename")
            return respond_error("Failed to process filename", 500)

        # Save file to disk
        file_path = os.path.join(current_app.config["UPLOAD_FOLDER"], unique_filename)
        file.save(file_path)

        # Get image dimensions and metadata
        width, height = None, None
        mime_type = file.content_type or "image/jpeg"
        file_size = os.path.getsize(file_path)

        try:
            with PILImage.open(file_path) as img:
                width, height = img.size
        except Exception as e:
            logger.warning(f"Could not read image dimensions: {e}")

        # Save metadata to database
        image_record = Image(
            user_id=user_id,
            filename=unique_filename,
            original_name=file.filename,
            file_path=file_path,
            file_size=file_size,
            mime_type=mime_type,
            width=width,
            height=height,
        )

        db.session.add(image_record)
        db.session.commit()

        # Generate public URL - use relative path that will go through gateway
        file_url = f"/api/v1/media/get/{unique_filename}"

        logger.info(f"File uploaded successfully: {unique_filename} for user {user_id}")
        return respond_success(
            {
                "id": image_record.id,
                "filename": unique_filename,
                "url": file_url,
                "original_name": file.filename,
                "file_size": file_size,
                "width": width,
                "height": height,
                "mime_type": mime_type,
            },
            "File uploaded successfully",
        )

    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        # Cleanup file if database save failed
        if "file_path" in locals() and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
        return respond_error("Internal server error during upload", 500)
