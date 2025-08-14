"""
File handling utilities
"""

import os
import uuid

from werkzeug.utils import secure_filename

# Configuration
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def allowed_file(filename):
    """Check if file extension is allowed"""
    has_extension = "." in filename
    if not has_extension:
        return False
    extension = filename.rsplit(".", 1)[1].lower()
    return extension in ALLOWED_EXTENSIONS


def generate_unique_filename(original_filename):
    """Generate unique filename while preserving extension"""
    if not original_filename:
        return None

    name, ext = os.path.splitext(secure_filename(original_filename))
    unique_id = str(uuid.uuid4())
    return f"{name}_{unique_id}{ext}"
