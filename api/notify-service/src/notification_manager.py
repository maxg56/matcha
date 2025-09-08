from typing import Dict
from fastapi import WebSocket
from src.types import Notification
from src.db_connect import db_connection


class NotificationManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        conn = db_connection()
        if conn:
            cur = conn.cursor()
            cur.execute("""
            SELECT *
            FROM notifications
            ORDER BY time DESC;
            """)
            rows = cur.fetchall()
            cur.close()
            conn.close()
            for row in rows:
                notif = Notification(
                    notif_type=row[2],
                    message=row[3],
                    to_user_id=row[1]
                )
                await websocket.send_json(notif.to_dict())

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_notification(self, to_user_id: int, notif_type: str, message: str):
        notif = Notification(notif_type=notif_type, message=message, to_user_id=to_user_id)
        user_id = notif.to_user_id
        if user_id in self.active_connections:
            ws = self.active_connections[user_id]
            await ws.send_json(notif.to_dict())

