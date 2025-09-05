import numpy as np
from typing import Dict, List, Tuple, Optional
from math import sqrt, radians, cos, sin, asin
import random

def normalize_vector(vector: np.ndarray) -> np.ndarray:
    """Normalize vector to unit length"""
    norm = np.linalg.norm(vector)
    if norm == 0:
        return vector
    return vector / norm

def cosine_similarity(vector_a: np.ndarray, vector_b: np.ndarray) -> float:
    """
    Calculate cosine similarity between two vectors
    Returns value between -1 and 1, where 1 is most similar
    """
    # Normalize vectors
    norm_a = normalize_vector(vector_a)
    norm_b = normalize_vector(vector_b)
    
    # Calculate cosine similarity
    dot_product = np.dot(norm_a, norm_b)
    
    # Clamp to [-1, 1] to handle floating point errors
    return max(-1.0, min(1.0, dot_product))

def euclidean_distance(vector_a: np.ndarray, vector_b: np.ndarray) -> float:
    """Calculate Euclidean distance between two vectors"""
    return float(np.linalg.norm(vector_a - vector_b))

def weighted_similarity(vector_a: np.ndarray, vector_b: np.ndarray, weights: np.ndarray) -> float:
    """
    Calculate weighted similarity between vectors
    
    Args:
        vector_a: First vector
        vector_b: Second vector  
        weights: Weight vector (same dimensions as vectors)
        
    Returns:
        Weighted similarity score (higher = more similar)
    """
    # Apply weights to the difference
    weighted_diff = weights * (vector_a - vector_b) ** 2
    weighted_distance = sqrt(np.sum(weighted_diff))
    
    # Convert distance to similarity (0-1 scale, higher is better)
    max_possible_distance = sqrt(np.sum(weights))
    if max_possible_distance == 0:
        return 1.0
    
    similarity = 1.0 - (weighted_distance / max_possible_distance)
    return max(0.0, min(1.0, similarity))

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on Earth
    Returns distance in kilometers
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    
    # Radius of Earth in kilometers
    r = 6371
    
    return c * r

def user_to_vector(user_data: Dict, include_location: bool = True) -> np.ndarray:
    """
    Convert user data to numerical vector for similarity calculations
    
    Args:
        user_data: User data dictionary (from User.to_matrix_dict())
        include_location: Whether to include lat/lng in vector
        
    Returns:
        NumPy array representing user as vector
    """
    vector_components = []
    
    # Age (normalized to 0-1, assuming age range 18-80)
    age = user_data.get('age', 25)
    vector_components.append((age - 18) / 62)  # Normalize 18-80 to 0-1
    
    # Height (normalized, assuming range 140-220cm)
    height = user_data.get('height', 170)
    vector_components.append((height - 140) / 80)
    
    # Fame (normalized, assuming range 0-100)
    fame = user_data.get('fame', 0)
    vector_components.append(fame / 100)
    
    # Lifestyle attributes (already encoded 0-1)
    lifestyle_attrs = [
        'alcohol_consumption', 'smoking', 'cannabis', 'drugs', 'pets',
        'social_activity_level', 'sport_activity', 'education_level',
        'religion', 'relationship_type', 'children_status',
        'hair_color', 'skin_color', 'eye_color', 'zodiac_sign',
        'gender', 'sex_pref', 'political_view'
    ]
    
    for attr in lifestyle_attrs:
        vector_components.append(user_data.get(attr, 0.0))
    
    # Location (if requested)
    if include_location:
        # Normalize lat/lng to 0-1 ranges
        lat = user_data.get('latitude', 0.0)
        lng = user_data.get('longitude', 0.0)
        
        # Rough normalization (lat: -90 to 90, lng: -180 to 180)
        vector_components.append((lat + 90) / 180)
        vector_components.append((lng + 180) / 360)
    
    return np.array(vector_components, dtype=np.float64)

def create_preference_weights(user_preferences: Optional[Dict] = None) -> np.ndarray:
    """
    Create weight vector for different user attributes
    
    Args:
        user_preferences: User's preference weights
        
    Returns:
        Weight vector matching user_to_vector structure
    """
    # Default weights
    default_weights = {
        'age': 0.2,
        'distance': 0.3,
        'interests': 0.25,  # Covers lifestyle attributes
        'habits': 0.15,     # Covers substance use, etc.
        'relationship': 0.1 # Covers relationship type
    }
    
    if user_preferences:
        default_weights.update(user_preferences)
    
    # Map to vector components
    weights = []
    
    # Age weight
    weights.append(default_weights['age'])
    
    # Height weight (part of physical attributes)
    weights.append(0.1)
    
    # Fame weight (social validation)
    weights.append(0.05)
    
    # Lifestyle attributes (interests/habits)
    lifestyle_weight = default_weights['interests'] / 15  # Distribute among 15 attributes
    for _ in range(15):
        weights.append(lifestyle_weight)
    
    # Location weights (distance)
    weights.extend([default_weights['distance'], default_weights['distance']])
    
    return np.array(weights, dtype=np.float64)

def update_preference_vector(current_vector: np.ndarray, target_vector: np.ndarray, 
                           interaction_type: str, learning_rate: float = 0.1) -> np.ndarray:
    """
    Update user preference vector based on interaction
    
    Args:
        current_vector: Current preference vector
        target_vector: Vector of user being interacted with
        interaction_type: 'like' or 'pass'
        learning_rate: How much to adjust (0-1)
        
    Returns:
        Updated preference vector
    """
    if interaction_type == 'like':
        # Move preference vector closer to liked profile
        direction = target_vector - current_vector
        adjustment = learning_rate * direction
    elif interaction_type == 'pass':
        # Move preference vector away from passed profile
        direction = current_vector - target_vector
        adjustment = learning_rate * direction
    else:
        return current_vector
    
    # Apply adjustment and normalize
    updated_vector = current_vector + adjustment
    return normalize_vector(updated_vector)

def add_randomness(scores: List[Tuple[int, float]], randomness_factor: float = 0.1) -> List[Tuple[int, float]]:
    """
    Add randomness to matching scores to provide variety
    
    Args:
        scores: List of (user_id, score) tuples
        randomness_factor: How much randomness to add (0-1)
        
    Returns:
        Scores with randomness applied
    """
    randomized_scores = []
    
    for user_id, score in scores:
        # Add random adjustment
        random_adjustment = (random.random() - 0.5) * 2 * randomness_factor
        new_score = max(0.0, min(1.0, score + random_adjustment))
        randomized_scores.append((user_id, new_score))
    
    return randomized_scores

def calculate_freshness_boost(days_since_creation: int, max_boost: float = 0.2) -> float:
    """
    Calculate freshness boost for newer profiles
    
    Args:
        days_since_creation: Days since profile was created
        max_boost: Maximum boost to apply
        
    Returns:
        Boost factor (0 to max_boost)
    """
    if days_since_creation <= 7:
        return max_boost * (1 - days_since_creation / 7)
    return 0.0