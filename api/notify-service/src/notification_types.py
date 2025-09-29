# Notification type constants
class NotificationType:
    LIKE = "1"              # When a user receives a "like"
    PROFILE_VIEW = "2"      # When a user's profile is viewed
    MESSAGE = "3"           # When a user receives a message (already implemented)
    MUTUAL_LIKE = "4"       # When a user they "liked" likes them back (mutual match)
    UNLIKE = "5"            # When a connected user "unlikes" them

class Notification:
    def __init__(self, notif_type: str, message: str, to_user_id: int, _db: bool = False):
        self.type = notif_type
        self.message = message
        self.to_user_id = to_user_id
        self.db = _db

    def to_dict(self):
        return {
            "type": self.type,
            "message": self.message,
            "to_user_id": self.to_user_id,
            "db": self.db
        }
