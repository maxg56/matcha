"""
Health check handler
"""

from utils.responses import respond_success


def health_check():
    """Health check endpoint"""
    return respond_success({"status": "ok", "service": "media-service"})
