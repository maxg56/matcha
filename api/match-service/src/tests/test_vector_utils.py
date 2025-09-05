import pytest
import numpy as np
from app.utils.vector_utils import (
    normalize_vector, cosine_similarity, euclidean_distance, 
    weighted_similarity, haversine_distance, user_to_vector,
    create_preference_weights, update_preference_vector,
    add_randomness, calculate_freshness_boost
)

class TestVectorUtils:
    """Test vector utility functions"""
    
    def test_normalize_vector(self):
        """Test vector normalization"""
        # Test normal vector
        vector = np.array([3.0, 4.0])
        normalized = normalize_vector(vector)
        assert np.isclose(np.linalg.norm(normalized), 1.0)
        
        # Test zero vector
        zero_vector = np.array([0.0, 0.0])
        normalized_zero = normalize_vector(zero_vector)
        assert np.array_equal(normalized_zero, zero_vector)
    
    def test_cosine_similarity(self):
        """Test cosine similarity calculation"""
        # Identical vectors
        v1 = np.array([1.0, 2.0, 3.0])
        v2 = np.array([1.0, 2.0, 3.0])
        similarity = cosine_similarity(v1, v2)
        assert np.isclose(similarity, 1.0)
        
        # Orthogonal vectors
        v3 = np.array([1.0, 0.0])
        v4 = np.array([0.0, 1.0])
        similarity = cosine_similarity(v3, v4)
        assert np.isclose(similarity, 0.0)
        
        # Opposite vectors
        v5 = np.array([1.0, 1.0])
        v6 = np.array([-1.0, -1.0])
        similarity = cosine_similarity(v5, v6)
        assert np.isclose(similarity, -1.0)
    
    def test_euclidean_distance(self):
        """Test Euclidean distance calculation"""
        v1 = np.array([0.0, 0.0])
        v2 = np.array([3.0, 4.0])
        distance = euclidean_distance(v1, v2)
        assert np.isclose(distance, 5.0)  # 3-4-5 triangle
    
    def test_weighted_similarity(self):
        """Test weighted similarity calculation"""
        v1 = np.array([1.0, 2.0])
        v2 = np.array([2.0, 3.0])
        weights = np.array([1.0, 0.5])
        
        similarity = weighted_similarity(v1, v2, weights)
        assert 0.0 <= similarity <= 1.0
        
        # Same vectors should have similarity 1
        similarity_same = weighted_similarity(v1, v1, weights)
        assert np.isclose(similarity_same, 1.0)
    
    def test_haversine_distance(self):
        """Test haversine distance calculation"""
        # Paris to London (roughly 344 km)
        paris_lat, paris_lng = 48.8566, 2.3522
        london_lat, london_lng = 51.5074, -0.1278
        
        distance = haversine_distance(paris_lat, paris_lng, london_lat, london_lng)
        assert 300 < distance < 400  # Approximate check
        
        # Same location should be 0 distance
        distance_same = haversine_distance(paris_lat, paris_lng, paris_lat, paris_lng)
        assert np.isclose(distance_same, 0.0)
    
    def test_user_to_vector(self):
        """Test user data to vector conversion"""
        user_data = {
            'id': 1,
            'age': 25,
            'height': 175,
            'fame': 10,
            'alcohol_consumption': 0.5,
            'smoking': 0.0,
            'cannabis': 0.0,
            'drugs': 0.0,
            'pets': 1.0,
            'social_activity_level': 2.0,
            'sport_activity': 3.0,
            'education_level': 3.0,
            'religion': 1.0,
            'relationship_type': 0.0,
            'children_status': 0.0,
            'hair_color': 2.0,
            'skin_color': 1.0,
            'eye_color': 3.0,
            'zodiac_sign': 5.0,
            'gender': 1.0,
            'sex_pref': 2.0,
            'political_view': 0.0,
            'latitude': 48.856613,
            'longitude': 2.352222
        }
        
        vector = user_to_vector(user_data)
        assert isinstance(vector, np.ndarray)
        assert len(vector) > 0
        
        # All values should be between 0 and 1 (normalized)
        assert np.all(vector >= 0.0)
        assert np.all(vector <= 1.0)
        
        # Test without location
        vector_no_location = user_to_vector(user_data, include_location=False)
        assert len(vector_no_location) < len(vector)
    
    def test_create_preference_weights(self):
        """Test preference weights creation"""
        weights = create_preference_weights()
        assert isinstance(weights, np.ndarray)
        assert len(weights) > 0
        assert np.all(weights >= 0.0)
        
        # Test with custom preferences
        custom_prefs = {'age': 0.5, 'distance': 0.3}
        custom_weights = create_preference_weights(custom_prefs)
        assert isinstance(custom_weights, np.ndarray)
    
    def test_update_preference_vector(self):
        """Test preference vector updates"""
        current = np.array([0.5, 0.5, 0.5])
        target = np.array([0.8, 0.3, 0.7])
        
        # Test like interaction (move closer)
        updated_like = update_preference_vector(current, target, 'like', 0.1)
        assert isinstance(updated_like, np.ndarray)
        assert len(updated_like) == len(current)
        
        # Test pass interaction (move away)
        updated_pass = update_preference_vector(current, target, 'pass', 0.1)
        assert isinstance(updated_pass, np.ndarray)
        assert len(updated_pass) == len(current)
        
        # Test invalid interaction (no change)
        updated_invalid = update_preference_vector(current, target, 'invalid', 0.1)
        assert np.array_equal(updated_invalid, current)
    
    def test_add_randomness(self):
        """Test randomness addition to scores"""
        scores = [(1, 0.8), (2, 0.7), (3, 0.6)]
        randomized = add_randomness(scores, randomness_factor=0.1)
        
        assert len(randomized) == len(scores)
        assert all(isinstance(item, tuple) for item in randomized)
        assert all(len(item) == 2 for item in randomized)
        
        # Scores should still be in valid range
        for user_id, score in randomized:
            assert 0.0 <= score <= 1.0
    
    def test_calculate_freshness_boost(self):
        """Test freshness boost calculation"""
        # New profile (1 day old)
        boost_new = calculate_freshness_boost(1)
        assert 0.0 < boost_new <= 0.2
        
        # Week old profile
        boost_week = calculate_freshness_boost(7)
        assert boost_week == 0.0
        
        # Old profile
        boost_old = calculate_freshness_boost(30)
        assert boost_old == 0.0
        
        # Brand new profile
        boost_brand_new = calculate_freshness_boost(0)
        assert boost_brand_new == 0.2  # Maximum boost