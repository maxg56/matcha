
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from src.auth import authenticate_websocket
from src.notification_manager import NotificationManager
from src.redis_listener import listen_redis
import redis.asyncio as aioredis
import os
import json


app = FastAPI()
manager = NotificationManager()

REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "notify-service"}


@app.websocket("/ws/notifications")
async def websocket_endpoint(websocket: WebSocket):
    try:
        user_id = authenticate_websocket(websocket)
        await manager.connect(user_id, websocket)
        while True:
            await websocket.receive_text()  # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception:
        manager.disconnect(user_id)


@app.get("/delete")
async def delete_notifications(user_id: int):
    manager.delete_notification(user_id)
    return {"status": "deleted", "user_id": user_id}


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(listen_redis(manager))


@app.post("/api/v1/notifications/send")
async def send_notification(payload: dict):
    """
    payload attendu :
    {
      "to_user_id": 7,
      "notif_type": "2",
      "message": "Tu as reçu un like ❤️"
    }
    """
    redis = aioredis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0)

    await redis.publish("notifications", json.dumps(payload))
    await redis.close()

    return {"status": "sent", "data": payload}
