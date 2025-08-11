import os

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "service": "notify-service"})


@app.route("/api/v1/notifications", methods=["GET"])
def get_notifications():
    # TODO: Implement get notifications logic
    return jsonify({"message": "Get notifications endpoint"})


@app.route("/api/v1/notifications/send", methods=["POST"])
def send_notification():
    # TODO: Implement send notification logic
    return jsonify({"message": "Send notification endpoint"})


@app.route("/api/v1/notifications/mark-read", methods=["PUT"])
def mark_as_read():
    # TODO: Implement mark as read logic
    return jsonify({"message": "Mark as read endpoint"})


@app.route("/api/v1/notifications/settings", methods=["GET", "PUT"])
def notification_settings():
    # TODO: Implement notification settings logic
    if request.method == "GET":
        return jsonify({"message": "Get notification settings endpoint"})
    else:
        return jsonify({"message": "Update notification settings endpoint"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8005))
    app.run(host="0.0.0.0", port=port, debug=True)
