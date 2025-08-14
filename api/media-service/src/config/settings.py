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

# Database settings
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_NAME = os.getenv("DB_NAME", "matcha_dev")


def get_upload_folder():
    """Get the upload folder path"""
    return os.path.abspath(UPLOAD_FOLDER)


def get_port():
    """Get the server port from environment or default"""
    return int(os.environ.get("PORT", DEFAULT_PORT))


def get_debug_mode():
    """Get debug mode from environment or default"""
    return os.environ.get("DEBUG", "true").lower() == "true"


def get_database_url():
    """Get database connection URL"""
    return f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/" f"{DB_NAME}"
