import jwt
import time
from typing import Optional, Dict, Any
from flask import request, jsonify, current_app
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from functools import wraps
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# Rate limiter instance
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=settings.redis_url if settings.RATE_LIMIT_ENABLED else None,
    default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE} per minute"]
)

def init_security(app):
    """Initialize security components"""
    if settings.RATE_LIMIT_ENABLED:
        limiter.init_app(app)
        logger.info(f"Rate limiting enabled: {settings.RATE_LIMIT_PER_MINUTE} requests per minute")
    else:
        logger.info("Rate limiting disabled")
    
    return limiter

def validate_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Validate JWT token and extract payload
    
    Args:
        token: JWT token string
        
    Returns:
        Token payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET_KEY, 
            algorithms=['HS256']
        )
        
        # Check expiration
        if payload.get('exp', 0) < time.time():
            logger.warning("JWT token expired")
            return None
            
        return payload
        
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid JWT token: {e}")
        return None
    except Exception as e:
        logger.error(f"JWT validation error: {e}")
        return None

def require_jwt_auth(f):
    """Decorator to require JWT authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({
                'success': False,
                'error': 'Authorization header required'
            }), 401
        
        # Extract token
        try:
            token = auth_header.split(' ')[1]  # "Bearer <token>"
        except IndexError:
            return jsonify({
                'success': False,
                'error': 'Invalid authorization header format'
            }), 401
        
        # Validate token
        payload = validate_jwt_token(token)
        if not payload:
            return jsonify({
                'success': False,
                'error': 'Invalid or expired token'
            }), 401
        
        # Add user info to request
        request.jwt_payload = payload
        
        return f(*args, **kwargs)
    
    return decorated_function

def validate_user_access(allowed_roles: list = None):
    """Decorator to validate user access level"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(request, 'jwt_payload'):
                return jsonify({
                    'success': False,
                    'error': 'Authentication required'
                }), 401
            
            payload = request.jwt_payload
            user_role = payload.get('role', 'user')
            
            if allowed_roles and user_role not in allowed_roles:
                return jsonify({
                    'success': False,
                    'error': 'Insufficient permissions'
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def rate_limit_by_user():
    """Rate limit decorator based on user ID"""
    def key_func():
        user_id = request.headers.get('X-User-ID')
        if user_id:
            return f"user:{user_id}"
        return get_remote_address()
    
    return limiter.limit(
        f"{settings.RATE_LIMIT_PER_MINUTE} per minute",
        key_func=key_func
    )

def validate_api_key(f):
    """Decorator to validate API key for internal services"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        expected_key = settings.JWT_SECRET_KEY  # Use same secret for simplicity
        
        if not api_key or api_key != expected_key:
            return jsonify({
                'success': False,
                'error': 'Invalid API key'
            }), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

def sanitize_input(data: Any) -> Any:
    """Basic input sanitization"""
    if isinstance(data, str):
        # Remove potentially dangerous characters
        dangerous_chars = ['<', '>', '"', "'", '&', '\x00']
        for char in dangerous_chars:
            data = data.replace(char, '')
        return data.strip()
    
    elif isinstance(data, dict):
        return {k: sanitize_input(v) for k, v in data.items()}
    
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    
    return data

def validate_request_size(max_size_mb: float = 1.0):
    """Decorator to validate request size"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            content_length = request.content_length
            max_size_bytes = max_size_mb * 1024 * 1024
            
            if content_length and content_length > max_size_bytes:
                return jsonify({
                    'success': False,
                    'error': f'Request too large (max: {max_size_mb}MB)'
                }), 413
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def log_security_event(event_type: str, user_id: str = None, details: Dict = None):
    """Log security-related events"""
    logger.warning(
        f"Security event: {event_type}",
        extra={
            'event_type': 'security',
            'security_event': event_type,
            'user_id': user_id,
            'ip_address': get_remote_address(),
            'user_agent': request.headers.get('User-Agent'),
            'details': details or {}
        }
    )

# Security middleware
class SecurityMiddleware:
    """Security middleware for additional protection"""
    
    def __init__(self, app=None):
        self.app = app
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        app.before_request(self.before_request)
        app.after_request(self.after_request)
    
    def before_request(self):
        """Run before each request"""
        # Log suspicious requests
        user_agent = request.headers.get('User-Agent', '').lower()
        suspicious_agents = ['bot', 'crawler', 'scanner', 'curl', 'wget']
        
        if any(agent in user_agent for agent in suspicious_agents):
            log_security_event('suspicious_user_agent', details={'user_agent': user_agent})
        
        # Check for common attack patterns in URLs
        suspicious_patterns = ['../', '<script', 'union select', 'drop table']
        request_url = request.url.lower()
        
        if any(pattern in request_url for pattern in suspicious_patterns):
            log_security_event('suspicious_url_pattern', details={'url': request.url})
            return jsonify({
                'success': False,
                'error': 'Suspicious request blocked'
            }), 400
    
    def after_request(self, response):
        """Run after each request"""
        # Add security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        return response

# Global security middleware instance
security_middleware = SecurityMiddleware()