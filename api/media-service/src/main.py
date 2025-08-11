import os

from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configure upload settings
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max file size


def allowed_file(filename):
    has_extension = "." in filename
    extension = filename.rsplit(".", 1)[1].lower()
    return has_extension and extension in ALLOWED_EXTENSIONS


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "service": "media-service"})


@app.route("/api/v1/media/upload", methods=["POST"])
def upload_file():
    # TODO: Implement file upload logic
    return jsonify({"message": "Upload file endpoint"})


@app.route("/api/v1/media/get/<filename>", methods=["GET"])
def get_file(filename):
    # TODO: Implement get file logic
    return jsonify({"message": f"Get file endpoint for {filename}"})


@app.route("/api/v1/media/delete/<filename>", methods=["DELETE"])
def delete_file(filename):
    # TODO: Implement delete file logic
    return jsonify({"message": f"Delete file endpoint for {filename}"})


@app.route("/api/v1/media/resize", methods=["POST"])
def resize_image():
    # TODO: Implement image resizing logic
    return jsonify({"message": "Resize image endpoint"})


if __name__ == "__main__":
    # Create upload directory if it doesn't exist
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    port = int(os.environ.get("PORT", 8006))
    app.run(host="0.0.0.0", port=port, debug=True)
