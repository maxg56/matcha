"""
Image resize handler
"""
import os
import logging
from flask import request, current_app
from werkzeug.utils import secure_filename
from PIL import Image
from utils.responses import respond_success, respond_error
from config.settings import MAX_IMAGE_DIMENSION, IMAGE_QUALITY

logger = logging.getLogger(__name__)


def resize_image():
    """Resize an image and return the resized version URL"""
    try:
        logger.info("Image resize request received")
        
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
            return respond_error(f"Width and height cannot exceed {MAX_IMAGE_DIMENSION} pixels", 400)
        
        # Secure the filename
        safe_filename = secure_filename(filename)
        file_path = os.path.join(current_app.config["UPLOAD_FOLDER"], safe_filename)
        
        # Check if file exists
        if not os.path.exists(file_path):
            logger.warning(f"File not found for resizing: {filename}")
            return respond_error("File not found", 404)
        
        # Open and resize image
        with Image.open(file_path) as img:
            # Resize image
            resized_img = img.resize((width, height), Image.Resampling.LANCZOS)
            
            # Generate new filename for resized image
            name, ext = os.path.splitext(safe_filename)
            resized_filename = f"{name}_resized_{width}x{height}{ext}"
            resized_path = os.path.join(current_app.config["UPLOAD_FOLDER"], resized_filename)
            
            # Save resized image
            resized_img.save(resized_path, optimize=True, quality=IMAGE_QUALITY)
        
        # Generate public URL
        base_url = request.host_url.rstrip("/")
        resized_url = f"{base_url}/api/v1/media/get/{resized_filename}"
        
        logger.info(f"Image resized successfully: {filename} -> {resized_filename}")
        return respond_success({
            "original_filename": filename,
            "resized_filename": resized_filename,
            "url": resized_url,
            "width": width,
            "height": height
        }, "Image resized successfully")
        
    except Exception as e:
        logger.error(f"Image resize error: {str(e)}")
        return respond_error("Internal server error during image resizing", 500)