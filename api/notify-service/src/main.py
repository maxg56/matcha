import os

from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import redis
import json
from queue import Queue


app = Flask(__name__)
CORS(app)

redis_host = os.environ.get("REDIS_HOST", "localhost")
redis_port = int(os.environ.get("REDIS_PORT", 6379))
r = redis.Redis(host=redis_host, port=redis_port, db=0, decode_responses=True)


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "service": "notify-service"})


@app.route("/api/v1/notifications", methods=["GET"])
def get_notifications():
    # Lire toutes les notifications stockées dans Redis
    notifications = r.lrange("notifications", 0, -1)
    return jsonify({"notifications": notifications})


REQUIRED_FIELDS = ["user_id", "sender_id", "message", "kind", "created_at"]


@app.route("/api/v1/notifications/send", methods=["POST"])
def send_notification():
    data = request.json

    # Vérification : tous les champs obligatoires doivent être présents
    missing = [field for field in REQUIRED_FIELDS if field not in data or data[field] is None]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    notification = {
        "user_id": data["user_id"],
        "sender_id": data["sender_id"],
        "message": data["message"],
        "kind": data["kind"],
        "created_at": data["created_at"],
    }

    # Sauvegarde en JSON dans Redis (liste "notifications")
    r.rpush("notifications", json.dumps(notification))
    r.publish(f"user:{data['user_id']}:channel", json.dumps(notification))

    return jsonify({"status": "sent", "notification": notification}), 201


# --- Endpoint SSE pour le client ---
@app.route("/api/v1/notifications/stream/<user_id>")
def stream_notifications(user_id):
    def event_stream():
        pubsub = r.pubsub()
        pubsub.subscribe(f"user:{user_id}:channel")
        for message in pubsub.listen():
            if message["type"] == "message":
                yield f"data: {message['data']}\n\n"
    return Response(event_stream(), mimetype="text/event-stream")


@app.route("/api/v1/notifications/settings", methods=["GET", "PUT"])
def notification_settings():
    # TODO: Implement notification settings logic
    if request.method == "GET":
        return jsonify({"message": "Get notification settings endpoint"})
    else:
        return jsonify({"message": "Update notification settings endpoint"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8005))
    app.run(host="0.0.0.0", port=port, debug=False)
