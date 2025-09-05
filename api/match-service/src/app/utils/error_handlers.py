from flask import jsonify
import logging

# Set up logging
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

def handle_database_error(error):
    """Handle database-related errors"""
    logger.error(f"Database error: {str(error)}")
    return jsonify({
        "success": False,
        "error": "Database connection error. Please try again later."
    }), 500

def handle_validation_error(error_message: str, status_code: int = 400):
    """Handle validation errors"""
    return jsonify({
        "success": False,
        "error": error_message
    }), status_code

def handle_internal_error(error):
    """Handle internal server errors"""
    logger.error(f"Internal error: {str(error)}")
    return jsonify({
        "success": False,
        "error": "Internal server error. Please try again later."
    }), 500

def handle_not_found_error(resource: str = "Resource"):
    """Handle not found errors"""
    return jsonify({
        "success": False,
        "error": f"{resource} not found."
    }), 404

def create_success_response(data, message: str = None):
    """Create standardized success response"""
    response = {
        "success": True,
        "data": data
    }
    
    if message:
        response["message"] = message
        
    return jsonify(response)

def create_error_response(error_message: str, status_code: int = 400):
    """Create standardized error response"""
    return jsonify({
        "success": False,
        "error": error_message
    }), status_code