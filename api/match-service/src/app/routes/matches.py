from flask import Blueprint, jsonify, request
from app.services.match_service import MatchService
from app.services.vector_matching_service import VectorMatchingService
from app.utils.validators import validate_user_id_header, validate_json_body, validate_target_user_id
from app.utils.error_handlers import create_success_response, create_error_response

matches_bp = Blueprint('matches', __name__, url_prefix='/api/v1/matches')

# Initialize services
match_service = MatchService()
vector_service = VectorMatchingService()

@matches_bp.route("", methods=["GET"])
@validate_user_id_header
def get_matches():
    """Get actual matches (mutual likes) for a user"""
    try:
        user_id = int(request.headers.get('X-User-ID'))
        matches = vector_service.get_user_matches(user_id)
        
        return create_success_response({
            "matches": matches,
            "count": len(matches),
            "user_id": user_id
        })
        
    except Exception as e:
        return create_error_response(f"Failed to get matches: {str(e)}", 500)

@matches_bp.route("/like", methods=["POST"])
@validate_user_id_header
@validate_json_body(['target_user_id'])
def like_user():
    """Like another user"""
    try:
        user_id = int(request.headers.get('X-User-ID'))
        data = request.get_json()
        target_user_id = validate_target_user_id(data)
        
        result = match_service.like_user(user_id, target_user_id)
        
        return create_success_response(result)
        
    except ValueError as e:
        return create_error_response(str(e), 400)
    except Exception as e:
        return create_error_response(f"Failed to like user: {str(e)}", 500)

@matches_bp.route("/unlike", methods=["POST"])
@validate_user_id_header
@validate_json_body(['target_user_id'])
def unlike_user():
    """Unlike (pass on) another user"""
    try:
        user_id = int(request.headers.get('X-User-ID'))
        data = request.get_json()
        target_user_id = validate_target_user_id(data)
        
        result = match_service.unlike_user(user_id, target_user_id)
        
        return create_success_response(result)
        
    except ValueError as e:
        return create_error_response(str(e), 400)
    except Exception as e:
        return create_error_response(f"Failed to unlike user: {str(e)}", 500)

@matches_bp.route("/block", methods=["POST"])
@validate_user_id_header
@validate_json_body(['target_user_id'])
def block_user():
    """Block another user"""
    try:
        user_id = int(request.headers.get('X-User-ID'))
        data = request.get_json()
        target_user_id = validate_target_user_id(data)
        
        result = match_service.block_user(user_id, target_user_id)
        
        return create_success_response(result)
        
    except ValueError as e:
        return create_error_response(str(e), 400)
    except Exception as e:
        return create_error_response(f"Failed to block user: {str(e)}", 500)

@matches_bp.route("/algorithm", methods=["GET"])
@validate_user_id_header
def matching_algorithm():
    """Run vector-based matching algorithm for a user"""
    try:
        user_id = int(request.headers.get('X-User-ID'))
        
        # Get optional parameters
        limit = min(50, max(1, int(request.args.get('limit', 20))))
        max_distance = request.args.get('max_distance')
        age_min = request.args.get('age_min')
        age_max = request.args.get('age_max')
        algorithm_type = request.args.get('algorithm_type', 'vector_based')
        
        # Parse optional parameters
        max_distance = int(max_distance) if max_distance else None
        age_range = None
        if age_min and age_max:
            age_range = (int(age_min), int(age_max))
        
        # Run matching algorithm
        matches = match_service.run_matching_algorithm(
            user_id=user_id,
            algorithm_type=algorithm_type,
            limit=limit,
            max_distance=max_distance,
            age_range=age_range
        )
        
        return create_success_response({
            "matches": matches,
            "count": len(matches),
            "algorithm_type": algorithm_type,
            "parameters": {
                "limit": limit,
                "max_distance": max_distance,
                "age_range": age_range
            }
        })
        
    except ValueError as e:
        return create_error_response(str(e), 400)
    except Exception as e:
        return create_error_response(f"Failed to run matching algorithm: {str(e)}", 500)