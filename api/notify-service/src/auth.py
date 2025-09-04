import jwt
from fastapi import HTTPException
from fastapi import WebSocket


def authenticate_websocket(websocket: WebSocket) -> int:
    token = websocket.query_params.get("token")
    print("Token reçu:", token)
    payload = jwt.decode(token, options={"verify_signature": False})
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    return int(payload.get("user_id", 0))
