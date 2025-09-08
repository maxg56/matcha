import asyncio
import redis.asyncio as aioredis
from src.types import Notification
from src.notification_manager import NotificationManager
import json
import os
from src.db_connect import db_connection

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
CHANNEL = os.getenv("REDIS_CHANNEL", "notifications")

redis = aioredis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0)

async def listen_redis(manager: NotificationManager):
    pubsub = redis.pubsub()
    await pubsub.subscribe(CHANNEL)
    print(f"✅ Subscribed to Redis channel: {CHANNEL} ({REDIS_HOST}:{REDIS_PORT})")
    async for message in pubsub.listen():
        if message["type"] == "message":
            data = json.loads(message["data"])
            conn = db_connection()
            await manager.send_notification(data["notif_type"], data["message"], data["to_user_id"])
            if conn:
                cur = conn.cursor()
                cur.execute(
                    "INSERT INTO notifications (notif_type, msg, to_user_id) VALUES (%s, %s, %s)",
                    (data["notif_type"], data["message"], data["to_user_id"])
                )
                conn.commit()
                cur.close()
                conn.close()
