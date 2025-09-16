"""
Handler pour réorganiser les images utilisateur
"""

import logging
from flask import request, jsonify
from models import Image

logger = logging.getLogger(__name__)


def reorder_images():
    """
    Réorganiser les images d'un utilisateur
    PUT /api/v1/media/order
    """
    try:
        # Récupérer l'ID utilisateur depuis les headers (fourni par la gateway)
        user_id = request.headers.get("X-User-ID")
        if not user_id:
            return jsonify({"success": False, "error": "User ID not found in headers"}), 401

        user_id = int(user_id)

        # Récupérer les données de réorganisation
        data = request.get_json()
        if not data or "images" not in data:
            return jsonify({"success": False, "error": "Missing 'images' in request body"}), 400

        image_orders = data["images"]
        if not isinstance(image_orders, list):
            return jsonify({"success": False, "error": "'images' must be a list"}), 400

        # Valider la structure des données
        for item in image_orders:
            if not isinstance(item, dict) or "id" not in item or "order_index" not in item:
                return jsonify({
                    "success": False,
                    "error": "Each image must have 'id' and 'order_index' fields"
                }), 400

            if not isinstance(item["id"], int) or not isinstance(item["order_index"], int):
                return jsonify({
                    "success": False,
                    "error": "'id' and 'order_index' must be integers"
                }), 400

        # Vérifier que toutes les images appartiennent à l'utilisateur
        image_ids = [item["id"] for item in image_orders]
        user_images = Image.query.filter(
            Image.id.in_(image_ids),
            Image.user_id == user_id,
            Image.is_active == True
        ).all()

        if len(user_images) != len(image_ids):
            return jsonify({
                "success": False,
                "error": "Some images don't belong to this user or don't exist"
            }), 403

        # Effectuer la réorganisation
        success = Image.reorder_user_images(user_id, image_orders)

        if success:
            # Récupérer les images mises à jour
            updated_images = Image.get_by_user_id(user_id)
            images_data = [image.to_dict() for image in updated_images]

            logger.info(f"Successfully reordered {len(image_orders)} images for user {user_id}")

            return jsonify({
                "success": True,
                "message": "Images reordered successfully",
                "data": {"images": images_data}
            }), 200
        else:
            return jsonify({"success": False, "error": "Failed to reorder images"}), 500

    except ValueError as e:
        logger.error(f"Value error in reorder_images: {e}")
        return jsonify({"success": False, "error": "Invalid data format"}), 400
    except Exception as e:
        logger.error(f"Error reordering images: {e}")
        return jsonify({"success": False, "error": "Internal server error"}), 500


def get_image_by_id(image_id):
    """
    Récupérer une image par son ID
    GET /api/v1/media/images/<image_id>
    """
    try:
        # Récupérer l'ID utilisateur depuis les headers
        user_id = request.headers.get("X-User-ID")
        if not user_id:
            return jsonify({"success": False, "error": "User ID not found in headers"}), 401

        user_id = int(user_id)
        image_id = int(image_id)

        # Récupérer l'image
        image = Image.query.filter_by(
            id=image_id,
            user_id=user_id,
            is_active=True
        ).first()

        if not image:
            return jsonify({"success": False, "error": "Image not found"}), 404

        return jsonify({
            "success": True,
            "data": {"image": image.to_dict()}
        }), 200

    except ValueError:
        return jsonify({"success": False, "error": "Invalid image ID"}), 400
    except Exception as e:
        logger.error(f"Error getting image: {e}")
        return jsonify({"success": False, "error": "Internal server error"}), 500


def update_image_metadata(image_id):
    """
    Mettre à jour les métadonnées d'une image
    PUT /api/v1/media/images/<image_id>
    """
    try:
        # Récupérer l'ID utilisateur depuis les headers
        user_id = request.headers.get("X-User-ID")
        if not user_id:
            return jsonify({"success": False, "error": "User ID not found in headers"}), 401

        user_id = int(user_id)
        image_id = int(image_id)

        # Récupérer l'image
        image = Image.query.filter_by(
            id=image_id,
            user_id=user_id,
            is_active=True
        ).first()

        if not image:
            return jsonify({"success": False, "error": "Image not found"}), 404

        # Récupérer les données de mise à jour
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400

        # Valider et appliquer les mises à jour
        description = data.get("description")
        alt_text = data.get("alt_text")
        visibility = data.get("visibility")

        # Valider la visibilité si fournie
        if visibility is not None:
            valid_visibilities = ["public", "private", "friends_only"]
            if visibility not in valid_visibilities:
                return jsonify({
                    "success": False,
                    "error": f"Invalid visibility. Must be one of: {', '.join(valid_visibilities)}"
                }), 400

        # Mettre à jour les métadonnées
        image.update_metadata(
            description=description,
            alt_text=alt_text,
            visibility=visibility
        )

        logger.info(f"Updated metadata for image {image_id} of user {user_id}")

        return jsonify({
            "success": True,
            "message": "Image metadata updated successfully",
            "data": {"image": image.to_dict()}
        }), 200

    except ValueError:
        return jsonify({"success": False, "error": "Invalid image ID"}), 400
    except Exception as e:
        logger.error(f"Error updating image metadata: {e}")
        return jsonify({"success": False, "error": "Internal server error"}), 500