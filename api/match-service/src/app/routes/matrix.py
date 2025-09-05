from flask import Blueprint, jsonify, request
from app.services.matrix_service import MatrixService

matrix_bp = Blueprint('matrix', __name__, url_prefix='/api/v1/matrix')

# Initialize matrix service
matrix_service = MatrixService()

@matrix_bp.route("/users", methods=["GET"])
def get_users_matrix():
    """Get users data in matrix format for matching calculations"""
    try:
        # Get optional user_ids parameter
        user_ids_param = request.args.get('user_ids')
        user_ids = None
        
        if user_ids_param:
            try:
                user_ids = [int(uid.strip()) for uid in user_ids_param.split(',')]
            except ValueError:
                return jsonify({
                    "success": False,
                    "error": "Invalid user_ids format. Use comma-separated integers."
                }), 400
        
        # Get include_metadata parameter (default True)
        include_metadata = request.args.get('include_metadata', 'true').lower() == 'true'
        
        # Convert users to matrix format
        matrix_data = matrix_service.get_users_matrix(user_ids, include_metadata)
        
        return jsonify({
            "success": True,
            "data": matrix_data
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to generate matrix: {str(e)}"
        }), 500

@matrix_bp.route("/compatible/<int:user_id>", methods=["GET"])
def get_compatible_matrix(user_id):
    """Get matrix of users compatible with specified user"""
    try:
        compatible_users = matrix_service.get_compatible_users_matrix(user_id)
        
        return jsonify({
            "success": True,
            "data": {
                "target_user_id": user_id,
                "compatible_users": compatible_users,
                "count": len(compatible_users)
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to get compatible users: {str(e)}"
        }), 500

@matrix_bp.route("/export", methods=["POST"])
def export_matrix():
    """Export users matrix to file"""
    try:
        data = request.get_json() or {}
        
        # Get parameters from request
        user_ids = data.get('user_ids')
        include_metadata = data.get('include_metadata', True)
        filename = data.get('filename', 'users_matrix.json')
        
        # Export matrix
        result = matrix_service.export_matrix_to_file(user_ids, include_metadata, filename)
        
        return jsonify({
            "success": True,
            "data": result
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to export matrix: {str(e)}"
        }), 500