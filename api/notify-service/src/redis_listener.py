import asyncio
import redis.asyncio as aioredis
from src.types import NotificationType, Notification
from src.notification_manager import NotificationManager
import json

REDIS_URL = "redis://redis:6379/0"  # À adapter
CHANNEL = "notifications"

async def listen_redis(manager: NotificationManager):
    redis = aioredis.from_url(REDIS_URL)
    pubsub = redis.pubsub()
    await pubsub.subscribe(CHANNEL)
    async for message in pubsub.listen():
        if message["type"] == "message":
            data = json.loads(message["data"])
            notif = Notification(
                notif_type=NotificationType(data["type"]),
                message=data["message"],
                to_user_id=data["to_user_id"]
            )
            await manager.send_notification(notif)
