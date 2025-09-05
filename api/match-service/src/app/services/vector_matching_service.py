import numpy as np
from typing import List, Dict, Tuple, Optional, Any
from datetime import datetime, timedelta
from sqlalchemy import and_, or_, not_, func
from app.config.database import db
from app.models import User, UserPreference, UserInteraction, Match
from app.utils.vector_utils import (
    user_to_vector, cosine_similarity, weighted_similarity, 
    haversine_distance, create_preference_weights, update_preference_vector,
    add_randomness, calculate_freshness_boost
)

class VectorMatchingService:
    """Advanced vector-based matching service with learning capabilities"""
    
    def __init__(self):
        self.learning_rate = 0.1
        self.randomness_factor = 0.15
        self.max_distance_km = 50  # Default max distance
        self.max_age_difference = 10  # Default max age difference
        
    def get_or_create_user_preference(self, user_id: int) -> UserPreference:
        """Get or create user preference vector"""
        preference = UserPreference.query.filter_by(user_id=user_id).first()
        
        if not preference:
            # Create initial preference based on user's own attributes
            user = User.query.get(user_id)
            if not user:
                raise ValueError(f"User {user_id} not found")
            
            # Initialize preference vector with user's own vector
            user_vector = user_to_vector(user.to_matrix_dict())
            
            preference = UserPreference(
                user_id=user_id,
                preference_vector='[]'  # Will be set below
            )
            preference.set_preference_vector(user_vector.tolist())
            
            db.session.add(preference)
            db.session.commit()
            
        return preference
    
    def update_user_preferences(self, user_id: int, target_user_id: int, interaction_type: str):
        """Update user preference vector based on interaction"""
        preference = self.get_or_create_user_preference(user_id)
        target_user = User.query.get(target_user_id)
        
        if not target_user:
            return
        
        # Get current preference vector
        current_vector = np.array(preference.get_preference_vector())
        target_vector = user_to_vector(target_user.to_matrix_dict())
        
        # Update preference vector
        updated_vector = update_preference_vector(
            current_vector, target_vector, interaction_type, self.learning_rate
        )
        
        # Save updated preference
        preference.set_preference_vector(updated_vector.tolist())
        
        # Update interaction counts
        if interaction_type == 'like':
            preference.total_likes += 1
        elif interaction_type == 'pass':
            preference.total_passes += 1
            
        preference.last_updated = datetime.utcnow()
        db.session.commit()
    
    def calculate_compatibility_score(self, user_id: int, candidate_id: int) -> float:
        """Calculate compatibility score between two users"""
        user = User.query.get(user_id)
        candidate = User.query.get(candidate_id)
        
        if not user or not candidate:
            return 0.0
        
        # Get user's preference vector
        preference = self.get_or_create_user_preference(user_id)
        preference_vector = np.array(preference.get_preference_vector())
        preference_weights = create_preference_weights(preference.get_weights())
        
        # Get candidate's vector
        candidate_vector = user_to_vector(candidate.to_matrix_dict())
        
        # Calculate weighted similarity
        similarity_score = weighted_similarity(
            preference_vector, candidate_vector, preference_weights
        )
        
        # Apply distance penalty if location data available
        if user.latitude and user.longitude and candidate.latitude and candidate.longitude:
            distance = haversine_distance(
                user.latitude, user.longitude,
                candidate.latitude, candidate.longitude
            )
            
            # Distance penalty (exponential decay)
            distance_factor = np.exp(-distance / 20)  # Decay factor
            similarity_score *= distance_factor
        
        # Apply age difference penalty
        age_diff = abs(user.age - candidate.age) if user.age and candidate.age else 0
        age_factor = max(0.5, 1 - (age_diff / 20))  # Penalty for large age gaps
        similarity_score *= age_factor
        
        # Apply freshness boost for newer profiles
        days_since_creation = (datetime.utcnow() - candidate.created_at).days
        freshness_boost = calculate_freshness_boost(days_since_creation)
        similarity_score += freshness_boost
        
        return min(1.0, max(0.0, similarity_score))
    
    def get_potential_matches(self, user_id: int, limit: int = 20, 
                            max_distance: Optional[int] = None,
                            age_range: Optional[Tuple[int, int]] = None) -> List[Dict[str, Any]]:
        """
        Get potential matches for a user using vector-based algorithm
        
        Args:
            user_id: Target user ID
            limit: Maximum number of matches to return
            max_distance: Maximum distance in km (optional)
            age_range: Tuple of (min_age, max_age) (optional)
            
        Returns:
            List of potential matches with compatibility scores
        """
        user = User.query.get(user_id)
        if not user:
            return []
        
        # Build base query for compatible users
        query = User.query.filter(
            User.id != user_id,
            User.latitude.isnot(None),
            User.longitude.isnot(None)
        )
        
        # Apply sexual compatibility filters
        if user.sex_pref == 'both':
            query = query.filter(
                or_(
                    User.sex_pref == user.gender,
                    User.sex_pref == 'both'
                )
            )
        else:
            query = query.filter(
                User.gender == user.sex_pref,
                or_(
                    User.sex_pref == user.gender,
                    User.sex_pref == 'both'
                )
            )
        
        # Apply age range filter
        if age_range:
            min_age, max_age = age_range
            query = query.filter(
                User.age >= min_age,
                User.age <= max_age
            )
        else:
            # Default age range based on user's age
            user_age = user.age or 25
            query = query.filter(
                User.age >= max(18, user_age - self.max_age_difference),
                User.age <= min(80, user_age + self.max_age_difference)
            )
        
        # Exclude users already interacted with
        interacted_user_ids = db.session.query(UserInteraction.target_user_id).filter(
            UserInteraction.user_id == user_id
        ).subquery()
        
        query = query.filter(~User.id.in_(interacted_user_ids))
        
        # Apply distance filter if specified and user has location
        candidates = query.all()
        
        if max_distance and user.latitude and user.longitude:
            filtered_candidates = []
            for candidate in candidates:
                if candidate.latitude and candidate.longitude:
                    distance = haversine_distance(
                        user.latitude, user.longitude,
                        candidate.latitude, candidate.longitude
                    )
                    if distance <= max_distance:
                        filtered_candidates.append(candidate)
            candidates = filtered_candidates
        
        # Calculate compatibility scores
        scored_candidates = []
        for candidate in candidates:
            score = self.calculate_compatibility_score(user_id, candidate.id)
            scored_candidates.append((candidate.id, score))
        
        # Sort by score and apply randomness
        scored_candidates.sort(key=lambda x: x[1], reverse=True)
        scored_candidates = add_randomness(scored_candidates, self.randomness_factor)
        
        # Re-sort after randomness
        scored_candidates.sort(key=lambda x: x[1], reverse=True)
        
        # Limit results
        scored_candidates = scored_candidates[:limit]
        
        # Build result with user details
        matches = []
        for candidate_id, score in scored_candidates:
            candidate = User.query.get(candidate_id)
            if candidate:
                candidate_data = {
                    'id': candidate.id,
                    'username': candidate.username,
                    'first_name': candidate.first_name,
                    'age': candidate.age,
                    'bio': candidate.bio,
                    'fame': candidate.fame,
                    'current_city': candidate.current_city,
                    'compatibility_score': round(score, 3),
                    'algorithm_type': 'vector_based'
                }
                
                # Add distance if available
                if (user.latitude and user.longitude and 
                    candidate.latitude and candidate.longitude):
                    distance = haversine_distance(
                        user.latitude, user.longitude,
                        candidate.latitude, candidate.longitude
                    )
                    candidate_data['distance_km'] = round(distance, 1)
                
                matches.append(candidate_data)
        
        return matches
    
    def record_interaction(self, user_id: int, target_user_id: int, interaction_type: str) -> Dict[str, Any]:
        """
        Record user interaction and update preferences
        
        Args:
            user_id: ID of user making the interaction
            target_user_id: ID of target user
            interaction_type: 'like', 'pass', or 'block'
            
        Returns:
            Dictionary with interaction result and match status
        """
        # Check if interaction already exists
        existing = UserInteraction.query.filter_by(
            user_id=user_id,
            target_user_id=target_user_id
        ).first()
        
        if existing:
            # Update existing interaction
            existing.interaction_type = interaction_type
            existing.created_at = datetime.utcnow()
        else:
            # Create new interaction
            interaction = UserInteraction(
                user_id=user_id,
                target_user_id=target_user_id,
                interaction_type=interaction_type
            )
            db.session.add(interaction)
        
        result = {
            'user_id': user_id,
            'target_user_id': target_user_id,
            'interaction_type': interaction_type,
            'match': False
        }
        
        # Check for mutual like (match)
        if interaction_type == 'like':
            mutual_like = UserInteraction.query.filter_by(
                user_id=target_user_id,
                target_user_id=user_id,
                interaction_type='like'
            ).first()
            
            if mutual_like:
                # Create match
                user1_id = min(user_id, target_user_id)
                user2_id = max(user_id, target_user_id)
                
                existing_match = Match.query.filter_by(
                    user1_id=user1_id,
                    user2_id=user2_id
                ).first()
                
                if not existing_match:
                    match = Match(user1_id=user1_id, user2_id=user2_id)
                    db.session.add(match)
                    result['match'] = True
                    result['match_id'] = match.id
        
        # Update user preferences based on interaction
        if interaction_type in ['like', 'pass']:
            self.update_user_preferences(user_id, target_user_id, interaction_type)
        
        db.session.commit()
        return result
    
    def get_user_matches(self, user_id: int) -> List[Dict[str, Any]]:
        """Get all matches for a user"""
        matches = Match.query.filter(
            or_(
                Match.user1_id == user_id,
                Match.user2_id == user_id
            ),
            Match.is_active == True
        ).all()
        
        result = []
        for match in matches:
            # Get the other user in the match
            other_user_id = match.user2_id if match.user1_id == user_id else match.user1_id
            other_user = User.query.get(other_user_id)
            
            if other_user:
                match_data = match.to_dict()
                match_data['matched_user'] = {
                    'id': other_user.id,
                    'username': other_user.username,
                    'first_name': other_user.first_name,
                    'age': other_user.age,
                    'bio': other_user.bio,
                    'fame': other_user.fame
                }
                result.append(match_data)
        
        return result