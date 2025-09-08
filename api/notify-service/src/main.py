
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from src.auth import authenticate_websocket
from src.notification_manager import NotificationManager
from src.redis_listener import listen_redis

app = FastAPI()
manager = NotificationManager()


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
