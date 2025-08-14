"""
User media management handlers
"""

import logging

from models import Image
from utils.auth import get_user_id_from_request
from utils.responses import respond_error, respond_success

logger = logging.getLogger(__name__)


def list_user_media():
    """List all media files for the authenticated user"""
    try:
        logger.info("User media list request received")

        # Get user ID from request
        user_id = get_user_id_from_request()
        if not user_id:
            return respond_error("Authentication required", 401)

        # Get all images for the user
        images = Image.get_by_user_id(user_id)

        # Convert to dict format
        media_list = []
        for image in images:
            media_list.append(
                {
                    "id": image.id,
                    "filename": image.filename,
                    "original_name": image.original_name,
                    "file_size": image.file_size,
                    "mime_type": image.mime_type,
                    "width": image.width,
                    "height": image.height,
                    "is_profile": image.is_profile,
                    "created_at": (
                        image.created_at.isoformat() if image.created_at else None
                    ),
                    "description": image.description,
                    "url": f"/api/v1/media/get/{image.filename}",
                }
            )

        logger.info(f"Returned {len(media_list)} media files for user {user_id}")
        return respond_success(
            {"media": media_list, "count": len(media_list)},
            f"Found {len(media_list)} media files",
        )

    except Exception as e:
        logger.error(f"List user media error: {str(e)}")
        return respond_error("Internal server error during media listing", 500)


def get_user_media(target_user_id):
    """Get media files for a specific user (public endpoint)"""
    try:
        logger.info(f"Public media list request for user {target_user_id}")

        try:
            target_user_id = int(target_user_id)
        except (ValueError, TypeError):
            return respond_error("Invalid user ID", 400)

        # Get all active, public images for the user
        # Note: In a real app, you might want to filter based on privacy settings
        images = Image.get_by_user_id(target_user_id)

        # Convert to dict format (limited info for public view)
        media_list = []
        for image in images:
            media_list.append(
                {
                    "id": image.id,
                    "filename": image.filename,
                    "width": image.width,
                    "height": image.height,
                    "is_profile": image.is_profile,
                    "created_at": (
                        image.created_at.isoformat() if image.created_at else None
                    ),
                    "url": f"/api/v1/media/get/{image.filename}",
                }
            )

        logger.info(
            f"Returned {len(media_list)} public media files for user {target_user_id}"
        )
        return respond_success(
            {"media": media_list, "user_id": target_user_id, "count": len(media_list)},
            f"Found {len(media_list)} media files",
        )

    except Exception as e:
        logger.error(f"Get user media error: {str(e)}")
        return respond_error("Internal server error during media retrieval", 500)


def set_profile_image():
    """Set an image as the user's profile image"""
    try:
        logger.info("Set profile image request received")

        # Get user ID from request
        user_id = get_user_id_from_request()
        if not user_id:
            return respond_error("Authentication required", 401)

        # Get image ID from request
        from flask import request

        data = request.get_json()
        if not data:
            return respond_error("JSON data required", 400)

        image_id = data.get("image_id")
        if not image_id:
            return respond_error("Image ID is required", 400)

        try:
            image_id = int(image_id)
        except (ValueError, TypeError):
            return respond_error("Invalid image ID", 400)

        # Find the image
        image = Image.query.filter_by(id=image_id, is_active=True).first()
        if not image:
            return respond_error("Image not found", 404)

        # Check if user owns this image
        if image.user_id != user_id:
            return respond_error(
                "Access denied: you can only set your own images as profile", 403
            )

        # Set as profile image
        image.set_as_profile()

        logger.info(
            f"Profile image set successfully: image {image_id} for user {user_id}"
        )
        return respond_success(
            {
                "id": image.id,
                "filename": image.filename,
                "is_profile": image.is_profile,
            },
            "Profile image set successfully",
        )

    except Exception as e:
        logger.error(f"Set profile image error: {str(e)}")
        return respond_error("Internal server error during profile image setting", 500)
