"""
Application configuration settings
"""
import os

# Upload settings
UPLOAD_FOLDER = "uploads"
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

# Server settings
DEFAULT_PORT = 8006
DEFAULT_DEBUG = True

# Image processing settings
MAX_IMAGE_DIMENSION = 4096
IMAGE_QUALITY = 95

def get_upload_folder():
    """Get the upload folder path"""
    return os.path.abspath(UPLOAD_FOLDER)

def get_port():
    """Get the server port from environment or default"""
    return int(os.environ.get("PORT", DEFAULT_PORT))

def get_debug_mode():
    """Get debug mode from environment or default"""
    return os.environ.get("DEBUG", "true").lower() == "true"