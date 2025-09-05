from typing import List, Optional, Any, Dict
from functools import wraps
from flask import request, jsonify

def validate_user_id_header(f):
    """Decorator to validate X-User-ID header"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = request.headers.get('X-User-ID')
        if not user_id:
            return jsonify({
                "success": False,
                "error": "User ID is required in X-User-ID header"
            }), 401
        
        try:
            user_id = int(user_id)
            if user_id <= 0:
                raise ValueError("User ID must be positive")
        except ValueError:
            return jsonify({
                "success": False,
                "error": "Invalid User ID format"
            }), 400
            
        return f(*args, **kwargs)
    return decorated_function

def validate_json_body(required_fields: List[str] = None):
    """Decorator to validate JSON request body"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.is_json:
                return jsonify({
                    "success": False,
                    "error": "Content-Type must be application/json"
                }), 400
            
            data = request.get_json()
            if not data:
                return jsonify({
                    "success": False,
                    "error": "Request body cannot be empty"
                }), 400
            
            # Check required fields
            if required_fields:
                missing_fields = []
                for field in required_fields:
                    if field not in data:
                        missing_fields.append(field)
                
                if missing_fields:
                    return jsonify({
                        "success": False,
                        "error": f"Missing required fields: {', '.join(missing_fields)}"
                    }), 400
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def validate_user_ids_param(user_ids_str: Optional[str]) -> Optional[List[int]]:
    """
    Validate and parse user_ids parameter
    
    Args:
        user_ids_str: Comma-separated string of user IDs
        
    Returns:
        List of user IDs or None if empty
        
    Raises:
        ValueError: If format is invalid
    """
    if not user_ids_str:
        return None
        
    try:
        user_ids = [int(uid.strip()) for uid in user_ids_str.split(',')]
        
        # Validate all IDs are positive
        for uid in user_ids:
            if uid <= 0:
                raise ValueError(f"User ID must be positive: {uid}")
        
        return user_ids
    except ValueError:
        raise ValueError("Invalid user_ids format. Use comma-separated positive integers.")

def validate_pagination_params(page: str = None, limit: str = None) -> Dict[str, int]:
    """
    Validate and parse pagination parameters
    
    Args:
        page: Page number string
        limit: Results per page string
        
    Returns:
        Dictionary with validated page and limit values
        
    Raises:
        ValueError: If format is invalid
    """
    try:
        page_num = int(page) if page else 1
        limit_num = int(limit) if limit else 10
        
        if page_num <= 0:
            raise ValueError("Page number must be positive")
        
        if limit_num <= 0 or limit_num > 100:
            raise ValueError("Limit must be between 1 and 100")
            
        return {"page": page_num, "limit": limit_num}
    except ValueError:
        raise ValueError("Invalid pagination parameters")

def validate_target_user_id(data: Dict[str, Any]) -> int:
    """
    Validate target_user_id from request data
    
    Args:
        data: Request JSON data
        
    Returns:
        Validated target user ID
        
    Raises:
        ValueError: If target_user_id is missing or invalid
    """
    if 'target_user_id' not in data:
        raise ValueError("target_user_id is required")
    
    try:
        target_user_id = int(data['target_user_id'])
        if target_user_id <= 0:
            raise ValueError("target_user_id must be positive")
        return target_user_id
    except (ValueError, TypeError):
        raise ValueError("target_user_id must be a positive integer")