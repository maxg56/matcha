import pytest
import numpy as np
from app.services.vector_matching_service import VectorMatchingService
from app.models import User, UserPreference, UserInteraction, Match
from app.config.database import db

class TestVectorMatchingService:
    """Test vector matching service"""
    
    @pytest.fixture
    def service(self):
        """Create vector matching service instance"""
        return VectorMatchingService()
    
    def test_get_or_create_user_preference(self, app, sample_users, service):
        """Test user preference creation and retrieval"""
        with app.app_context():
            user = sample_users[0]
            
            # First call should create preference
            pref = service.get_or_create_user_preference(user.id)
            assert pref is not None
            assert pref.user_id == user.id
            assert pref.get_preference_vector() is not None
            
            # Second call should retrieve existing
            pref2 = service.get_or_create_user_preference(user.id)
            assert pref2.id == pref.id
            
            # Test with non-existent user
            with pytest.raises(ValueError):
                service.get_or_create_user_preference(999)
    
    def test_update_user_preferences(self, app, sample_users, service):
        """Test preference vector updates"""
        with app.app_context():
            user1 = sample_users[0]
            user2 = sample_users[1]
            
            # Create initial preference
            pref = service.get_or_create_user_preference(user1.id)
            initial_likes = pref.total_likes
            initial_passes = pref.total_passes
            
            # Test like interaction
            service.update_user_preferences(user1.id, user2.id, 'like')
            
            # Refresh preference
            db.session.refresh(pref)
            assert pref.total_likes == initial_likes + 1
            assert pref.total_passes == initial_passes
            
            # Test pass interaction
            service.update_user_preferences(user1.id, user2.id, 'pass')
            
            # Refresh preference
            db.session.refresh(pref)
            assert pref.total_passes == initial_passes + 1
    
    def test_calculate_compatibility_score(self, app, sample_users, service):
        """Test compatibility score calculation"""
        with app.app_context():
            user1 = sample_users[0]
            user2 = sample_users[1]
            
            score = service.calculate_compatibility_score(user1.id, user2.id)
            
            assert isinstance(score, float)
            assert 0.0 <= score <= 1.0
            
            # Test with same user (should work but not be meaningful)
            self_score = service.calculate_compatibility_score(user1.id, user1.id)
            assert isinstance(self_score, float)
            
            # Test with non-existent user
            invalid_score = service.calculate_compatibility_score(user1.id, 999)
            assert invalid_score == 0.0
    
    def test_get_potential_matches(self, app, sample_users, service):
        """Test potential matches retrieval"""
        with app.app_context():
            user1 = sample_users[0]  # Male likes females
            
            matches = service.get_potential_matches(user1.id, limit=10)
            
            assert isinstance(matches, list)
            assert len(matches) <= 10
            
            # Check that returned matches have required fields
            for match in matches:
                assert 'id' in match
                assert 'username' in match
                assert 'compatibility_score' in match
                assert 'algorithm_type' in match
                assert match['algorithm_type'] == 'vector_based'
                
                # Score should be valid
                assert 0.0 <= match['compatibility_score'] <= 1.0
            
            # Test with age range filter
            age_matches = service.get_potential_matches(
                user1.id, 
                limit=10,
                age_range=(20, 30)
            )
            
            assert isinstance(age_matches, list)
            for match in age_matches:
                # Should only include users in age range
                matched_user = User.query.get(match['id'])
                if matched_user and matched_user.age:
                    assert 20 <= matched_user.age <= 30
            
            # Test with distance filter
            distance_matches = service.get_potential_matches(
                user1.id,
                limit=10,
                max_distance=100
            )
            
            assert isinstance(distance_matches, list)
    
    def test_record_interaction(self, app, sample_users, service):
        """Test interaction recording"""
        with app.app_context():
            user1 = sample_users[0]
            user2 = sample_users[1]
            
            # Test like interaction
            result = service.record_interaction(user1.id, user2.id, 'like')
            
            assert result['user_id'] == user1.id
            assert result['target_user_id'] == user2.id
            assert result['interaction_type'] == 'like'
            assert 'match' in result
            
            # Verify interaction was saved
            interaction = UserInteraction.query.filter_by(
                user_id=user1.id,
                target_user_id=user2.id
            ).first()
            
            assert interaction is not None
            assert interaction.interaction_type == 'like'
            
            # Test mutual like (should create match)
            result2 = service.record_interaction(user2.id, user1.id, 'like')
            assert result2['match'] is True
            
            # Verify match was created
            match = Match.query.filter_by(
                user1_id=min(user1.id, user2.id),
                user2_id=max(user1.id, user2.id)
            ).first()
            
            assert match is not None
            assert match.is_active is True
            
            # Test pass interaction
            user3 = sample_users[2]
            result3 = service.record_interaction(user1.id, user3.id, 'pass')
            assert result3['interaction_type'] == 'pass'
            assert result3['match'] is False
            
            # Test block interaction
            user4 = sample_users[3]
            result4 = service.record_interaction(user1.id, user4.id, 'block')
            assert result4['interaction_type'] == 'block'
            assert result4['match'] is False
    
    def test_get_user_matches(self, app, sample_users, sample_match, service):
        """Test user matches retrieval"""
        with app.app_context():
            user1 = sample_users[0]
            
            matches = service.get_user_matches(user1.id)
            
            assert isinstance(matches, list)
            assert len(matches) >= 1  # Should have at least the sample match
            
            # Check match structure
            for match in matches:
                assert 'id' in match
                assert 'matched_at' in match
                assert 'matched_user' in match
                assert 'user1_id' in match
                assert 'user2_id' in match
                
                # Verify user is part of the match
                assert user1.id in [match['user1_id'], match['user2_id']]
                
                matched_user = match['matched_user']
                assert 'id' in matched_user
                assert 'username' in matched_user
                assert matched_user['id'] != user1.id  # Should be the other user
    
    def test_sexual_compatibility_filtering(self, app, sample_users, service):
        """Test that matches respect sexual orientation preferences"""
        with app.app_context():
            # User 1: Male likes females
            user1 = sample_users[0]
            matches = service.get_potential_matches(user1.id)
            
            for match in matches:
                matched_user = User.query.get(match['id'])
                # Should only match with females who like males or both
                if matched_user.gender == 'female':
                    assert matched_user.sex_pref in ['male', 'both']
            
            # User 4: Female likes females  
            user4 = sample_users[3]
            matches = service.get_potential_matches(user4.id)
            
            for match in matches:
                matched_user = User.query.get(match['id'])
                # Should only match with females who like females or both
                if matched_user.gender == 'female':
                    assert matched_user.sex_pref in ['female', 'both']
    
    def test_interaction_exclusion(self, app, sample_users, service):
        """Test that users already interacted with are excluded"""
        with app.app_context():
            user1 = sample_users[0]
            user2 = sample_users[1]
            
            # Get initial matches
            initial_matches = service.get_potential_matches(user1.id)
            initial_ids = [m['id'] for m in initial_matches]
            
            # Record interaction
            service.record_interaction(user1.id, user2.id, 'like')
            
            # Get matches again
            new_matches = service.get_potential_matches(user1.id)
            new_ids = [m['id'] for m in new_matches]
            
            # user2 should no longer be in matches
            if user2.id in initial_ids:
                assert user2.id not in new_ids