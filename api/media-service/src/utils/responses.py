"""
Utilities for standardized HTTP responses
"""

from flask import jsonify


def respond_success(data=None, message="Success"):
    """Standard success response format"""
    response = {"success": True}
    if data is not None:
        response["data"] = data
    if message != "Success":
        response["message"] = message
    return jsonify(response)


def respond_error(message, status_code=400):
    """Standard error response format"""
    response = {"success": False, "error": message}
    return jsonify(response), status_code
