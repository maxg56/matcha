import os
import uuid
import logging
from pathlib import Path

from flask import Flask, jsonify, request, send_file, abort
from flask_cors import CORS
from PIL import Image
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure upload settings
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max file size


def allowed_file(filename):
    """Check if file extension is allowed"""
    has_extension = "." in filename
    if not has_extension:
        return False
    extension = filename.rsplit(".", 1)[1].lower()
    return extension in ALLOWED_EXTENSIONS


def generate_unique_filename(original_filename):
    """Generate unique filename while preserving extension"""
    if not original_filename:
        return None
    
    name, ext = os.path.splitext(secure_filename(original_filename))
    unique_id = str(uuid.uuid4())
    return f"{name}_{unique_id}{ext}"


def respond_success(data=None, message="Success"):
    """Standard success response format"""
    response = {"success": True}
    if data is not None:
        response["data"] = data
    if message != "Success":
        response["message"] = message
    return jsonify(response)


def respond_error(message, status_code=400):
    """Standard error response format"""
    response = {"success": False, "error": message}
    return jsonify(response), status_code


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return respond_success({"status": "ok", "service": "media-service"})


@app.route("/api/v1/media/upload", methods=["POST"])
def upload_file():
    """Upload a file and return its URL"""
    try:
        logger.info("File upload request received")
        
        # Check if file is in request
        if "file" not in request.files:
            logger.warning("No file part in request")
            return respond_error("No file part in request", 400)
        
        file = request.files["file"]
        
        # Check if file was selected
        if file.filename == "":
            logger.warning("No file selected")
            return respond_error("No file selected", 400)
        
        # Check file type
        if not allowed_file(file.filename):
            logger.warning(f"File type not allowed: {file.filename}")
            return respond_error("File type not allowed. Allowed types: png, jpg, jpeg, gif, webp", 400)
        
        # Generate unique filename
        unique_filename = generate_unique_filename(file.filename)
        if not unique_filename:
            logger.error("Failed to generate unique filename")
            return respond_error("Failed to process filename", 500)
        
        # Save file
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], unique_filename)
        file.save(file_path)
        
        # Generate public URL
        base_url = request.host_url.rstrip("/")
        file_url = f"{base_url}/api/v1/media/get/{unique_filename}"
        
        logger.info(f"File uploaded successfully: {unique_filename}")
        return respond_success({
            "filename": unique_filename,
            "url": file_url,
            "original_name": file.filename
        }, "File uploaded successfully")
        
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        return respond_error("Internal server error during upload", 500)


@app.route("/api/v1/media/get/<filename>", methods=["GET"])
def get_file(filename):
    """Retrieve a file by filename"""
    try:
        logger.info(f"File retrieval request for: {filename}")
        
        # Secure the filename
        safe_filename = secure_filename(filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], safe_filename)
        
        # Check if file exists
        if not os.path.exists(file_path):
            logger.warning(f"File not found: {filename}")
            return respond_error("File not found", 404)
        
        logger.info(f"File served successfully: {filename}")
        return send_file(file_path)
        
    except Exception as e:
        logger.error(f"File retrieval error: {str(e)}")
        return respond_error("Internal server error during file retrieval", 500)


@app.route("/api/v1/media/delete/<filename>", methods=["DELETE"])
def delete_file(filename):
    """Delete a file by filename"""
    try:
        logger.info(f"File deletion request for: {filename}")
        
        # Secure the filename
        safe_filename = secure_filename(filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], safe_filename)
        
        # Check if file exists
        if not os.path.exists(file_path):
            logger.warning(f"File not found for deletion: {filename}")
            return respond_error("File not found", 404)
        
        # Delete the file
        os.remove(file_path)
        
        logger.info(f"File deleted successfully: {filename}")
        return respond_success({"filename": filename}, "File deleted successfully")
        
    except Exception as e:
        logger.error(f"File deletion error: {str(e)}")
        return respond_error("Internal server error during file deletion", 500)


@app.route("/api/v1/media/resize", methods=["POST"])
def resize_image():
    """Resize an image and return the resized version URL"""
    try:
        logger.info("Image resize request received")
        
        data = request.get_json()
        if not data:
            return respond_error("JSON data required", 400)
        
        filename = data.get("filename")
        width = data.get("width")
        height = data.get("height")
        
        # Validate required fields
        if not filename:
            return respond_error("Filename is required", 400)
        
        if not width or not height:
            return respond_error("Width and height are required", 400)
        
        try:
            width = int(width)
            height = int(height)
        except (ValueError, TypeError):
            return respond_error("Width and height must be valid integers", 400)
        
        if width <= 0 or height <= 0:
            return respond_error("Width and height must be positive integers", 400)
        
        if width > 4096 or height > 4096:
            return respond_error("Width and height cannot exceed 4096 pixels", 400)
        
        # Secure the filename
        safe_filename = secure_filename(filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], safe_filename)
        
        # Check if file exists
        if not os.path.exists(file_path):
            logger.warning(f"File not found for resizing: {filename}")
            return respond_error("File not found", 404)
        
        # Open and resize image
        with Image.open(file_path) as img:
            # Resize image
            resized_img = img.resize((width, height), Image.Resampling.LANCZOS)
            
            # Generate new filename for resized image
            name, ext = os.path.splitext(safe_filename)
            resized_filename = f"{name}_resized_{width}x{height}{ext}"
            resized_path = os.path.join(app.config["UPLOAD_FOLDER"], resized_filename)
            
            # Save resized image
            resized_img.save(resized_path, optimize=True, quality=95)
        
        # Generate public URL
        base_url = request.host_url.rstrip("/")
        resized_url = f"{base_url}/api/v1/media/get/{resized_filename}"
        
        logger.info(f"Image resized successfully: {filename} -> {resized_filename}")
        return respond_success({
            "original_filename": filename,
            "resized_filename": resized_filename,
            "url": resized_url,
            "width": width,
            "height": height
        }, "Image resized successfully")
        
    except Exception as e:
        logger.error(f"Image resize error: {str(e)}")
        return respond_error("Internal server error during image resizing", 500)


if __name__ == "__main__":
    # Create upload directory if it doesn't exist
    upload_path = Path(UPLOAD_FOLDER)
    upload_path.mkdir(exist_ok=True)
    
    port = int(os.environ.get("PORT", 8006))
    debug_mode = os.environ.get("DEBUG", "true").lower() == "true"
    
    logger.info(f"Starting media service on port {port}")
    logger.info(f"Upload directory: {upload_path.absolute()}")
    
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
