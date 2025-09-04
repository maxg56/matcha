import asyncio
import redis.asyncio as aioredis
from src.types import Notification
from src.notification_manager import NotificationManager
import json
import os

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
            notif = Notification(
                notif_type=data["notif_type"],
                message=data["message"],
                to_user_id=data["to_user_id"]
            )
            await manager.send_notification(notif)
