from typing import Dict
from fastapi import WebSocket
from src.types import Notification


class NotificationManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_notification(self, notification: Notification):
        user_id = notification.to_user_id
        if user_id in self.active_connections:
            ws = self.active_connections[user_id]
            await ws.send_json(notification.to_dict())
