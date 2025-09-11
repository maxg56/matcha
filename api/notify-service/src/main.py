
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from src.auth import authenticate_websocket
from src.notification_manager import NotificationManager
from src.redis_listener import listen_redis
import redis.asyncio as aioredis
import os
import json
from src.notification_types import Notification
from src.db_connect import db_connection


app = FastAPI()
manager = NotificationManager()

REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "notify-service"}


@app.get("/api/v1/notifications/get")
async def get_notifications(user_id: str):
    user_id = int(user_id)
    conn = db_connection()
    if conn:
        cur = conn.cursor()
        cur.execute("""
        SELECT *
        FROM notifications
        WHERE to_user_id = %s
        ORDER BY time ASC;
        """, (user_id,))
        rows = cur.fetchall()
        cur.close()
        conn.close()
        for row in rows:
            notif = Notification(
                notif_type=row[2],
                message=row[3],
                to_user_id=row[1]
            )
            if manager.gateway_connection:
                try:
                    gateway_message = {"type": "notification_received", "data": notif.to_dict()}
                    await manager.gateway_connection.send_json(gateway_message)
                    print(f"📨 Notification from db forwarded to gateway for user {notif.to_user_id}")
                except Exception as e:
                    print(f"❌ Failed to send notification to gateway: {e}")
                    manager.gateway_connection = None
                    return {"status": "error", "message": "gateway not connected"}
    else:
        return {"status": "error", "message": "Database connection failed"}
    return {"status": "ok", "user_id": user_id}


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


@app.websocket("/ws/gateway")
async def gateway_websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint specifically for the gateway service"""
    try:
        await websocket.accept()
        print("✅ Gateway WebSocket connected")
        manager.gateway_connection = websocket
        while True:
            await websocket.receive_text()  # Keep connection alive
    except WebSocketDisconnect:
        print("❌ Gateway WebSocket disconnected")
        manager.gateway_connection = None
    except Exception as e:
        print(f"❌ Gateway WebSocket error: {e}")
        manager.gateway_connection = None


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
