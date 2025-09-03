from enum import Enum

class NotificationType(str, Enum):
    PROFILE_VIEW = 1
    UNLIKE = 2
    LIKE = 3
    MESSAGE = 4
    MATCH = 5

class Notification:
    def __init__(self, notif_type: NotificationType, message: str, to_user_id: int):
        self.type = notif_type
        self.message = message
        self.to_user_id = to_user_id

    def to_dict(self):
        return {
            "type": self.type,
            "message": self.message,
            "to_user_id": self.to_user_id
        }
