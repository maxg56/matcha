"""
Utilities for authentication and user handling
"""

import logging

import jwt
from flask import request

logger = logging.getLogger(__name__)


def get_user_id_from_request():
    """
    Extraire l'ID utilisateur depuis les headers JWT
    Le gateway ajoute X-User-ID header après validation JWT
    """
    # Priorité 1: Header X-User-ID ajouté par le gateway
    user_id = request.headers.get("X-User-ID")
    if user_id:
        try:
            return int(user_id)
        except (ValueError, TypeError):
            logger.warning(f"Invalid X-User-ID header: {user_id}")

    # Priorité 2: Extraire depuis le token JWT directement (pour les tests)
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            # En production, la validation JWT se fait au niveau du gateway
            # Pour les tests locaux, on valide quand même la signature
            import os
            jwt_secret = os.getenv("JWT_SECRET")
            if jwt_secret:
                payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])
                return int(payload.get("sub", 0))
            else:
                logger.warning("JWT_SECRET not configured, skipping JWT validation")
                return None
        except (jwt.InvalidTokenError, ValueError, KeyError):
            logger.warning("Failed to extract user_id from JWT token")

    # Fallback pour les tests (utiliser un header de test)
    test_user_id = request.headers.get("X-Test-User-ID")
    if test_user_id:
        try:
            return int(test_user_id)
        except (ValueError, TypeError):
            logger.warning(f"Invalid X-Test-User-ID header: {test_user_id}")

    return None


def require_user_id():
    """
    Décorateur pour s'assurer qu'un user_id valide est présent
    """

    def decorator(f):
        def wrapper(*args, **kwargs):
            user_id = get_user_id_from_request()
            if not user_id:
                from utils.responses import respond_error

                return respond_error("Authentication required", 401)
            return f(user_id, *args, **kwargs)

        wrapper.__name__ = f.__name__
        return wrapper

    return decorator
