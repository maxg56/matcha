from typing import List, Dict, Any, Optional
from sqlalchemy import text
from app.config.database import db
from app.models import User, UserInteraction, Match
from app.services.vector_matching_service import VectorMatchingService

class MatchService:
    """Service layer for matching operations"""
    
    def __init__(self):
        """Initialize match service"""
        self.vector_service = VectorMatchingService()
    
    def get_user_matches(self, user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get basic potential matches for a user (fallback method)
        """
        """
        Get potential matches for a user
        
        Args:
            user_id: ID of the user to find matches for
            limit: Maximum number of matches to return
            
        Returns:
            List of potential matches
        """
        # Basic matching algorithm based on sexual preferences and location
        
        # Get target user's preferences
        target_user = User.query.filter_by(id=user_id).first()
        if not target_user:
            return []
        
        target_gender = target_user.gender
        target_pref = target_user.sex_pref
        
        # Build query for compatible users
        query = User.query.filter(
            User.id != user_id,
            User.latitude.isnot(None),
            User.longitude.isnot(None)
        )
        
        # Apply compatibility filters
        if target_pref == 'both':
            # Target likes everyone, find people who like target's gender
            query = query.filter(
                db.or_(
                    User.sex_pref == target_gender,
                    User.sex_pref == 'both'
                )
            )
        else:
            # Target likes specific gender, find people of that gender who like target's gender
            query = query.filter(
                User.gender == target_pref,
                db.or_(
                    User.sex_pref == target_gender,
                    User.sex_pref == 'both'
                )
            )
        
        # Order and limit results
        compatible_users = query.order_by(
            User.fame.desc(),
            User.created_at.desc()
        ).limit(limit).all()
        
        # Convert to dict format
        return [{
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'age': user.age,
            'bio': user.bio,
            'fame': user.fame,
            'algorithm_type': 'basic'
        } for user in compatible_users]
    
    def like_user(self, user_id: int, target_user_id: int) -> Dict[str, Any]:
        """
        Like another user
        
        Args:
            user_id: ID of the user doing the liking
            target_user_id: ID of the user being liked
            
        Returns:
            Dictionary with like result and potential match status
        """
        return self.vector_service.record_interaction(user_id, target_user_id, 'like')
    
    def unlike_user(self, user_id: int, target_user_id: int) -> Dict[str, Any]:
        """
        Unlike another user
        
        Args:
            user_id: ID of the user doing the unliking
            target_user_id: ID of the user being unliked
            
        Returns:
            Dictionary with unlike result
        """
        return self.vector_service.record_interaction(user_id, target_user_id, 'pass')
    
    def block_user(self, user_id: int, target_user_id: int) -> Dict[str, Any]:
        """
        Block another user
        
        Args:
            user_id: ID of the user doing the blocking
            target_user_id: ID of the user being blocked
            
        Returns:
            Dictionary with block result
        """
        result = self.vector_service.record_interaction(user_id, target_user_id, 'block')
        
        # Deactivate any existing match
        match = Match.query.filter(
            db.or_(
                db.and_(Match.user1_id == user_id, Match.user2_id == target_user_id),
                db.and_(Match.user1_id == target_user_id, Match.user2_id == user_id)
            )
        ).first()
        
        if match:
            match.is_active = False
            db.session.commit()
            result['match_deactivated'] = True
        
        return result
    
    def run_matching_algorithm(self, user_id: int, algorithm_type: str = 'vector_based', 
                              limit: int = 20, max_distance: Optional[int] = None,
                              age_range: Optional[tuple] = None) -> List[Dict[str, Any]]:
        """
        Run sophisticated matching algorithm for a user
        
        Args:
            user_id: ID of the user to find matches for
            algorithm_type: Type of algorithm to use ('vector_based', 'basic')
            limit: Maximum number of matches to return
            max_distance: Maximum distance in km
            age_range: Tuple of (min_age, max_age)
            
        Returns:
            List of ranked matches with compatibility scores
        """
        if algorithm_type == 'vector_based':
            return self.vector_service.get_potential_matches(
                user_id, limit, max_distance, age_range
            )
        else:
            # Fallback to basic matching
            return self.get_user_matches(user_id, limit)