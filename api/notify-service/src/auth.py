import jwt
import os
from fastapi import HTTPException, Header, Depends
from fastapi import WebSocket
from typing import Optional


def authenticate_http(authorization: Optional[str] = Header(None)) -> int:
    """Authenticate HTTP requests using JWT tokens from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")

    token = authorization[7:]  # Remove "Bearer " prefix

    try:
        # Get JWT secret from environment variable
        jwt_secret = os.getenv("JWT_SECRET")
        if not jwt_secret:
            raise HTTPException(status_code=500, detail="JWT secret not configured")

        # Decode with signature verification enabled
        payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])

        # Validate payload structure
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        return int(user_id)

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid user ID in token")


def authenticate_websocket(websocket: WebSocket) -> int:
    token = websocket.query_params.get("token")

    if not token:
        raise HTTPException(status_code=401, detail="Token missing")

    try:
        # Get JWT secret from environment variable
        jwt_secret = os.getenv("JWT_SECRET")
        if not jwt_secret:
            raise HTTPException(status_code=500, detail="JWT secret not configured")

        # Decode with signature verification enabled
        payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])

        # Validate payload structure
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        return int(user_id)

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid user ID in token")
