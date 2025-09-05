from datetime import datetime
from app.config.database import db
import json

class UserPreference(db.Model):
    """User preference vector for dynamic matching algorithm"""
    __tablename__ = 'user_preferences'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    
    # Preference vector stored as JSON
    preference_vector = db.Column(db.Text, nullable=False)  # JSON string
    
    # Weights for different vector dimensions
    age_weight = db.Column(db.Float, default=0.2)
    distance_weight = db.Column(db.Float, default=0.3)
    interests_weight = db.Column(db.Float, default=0.25)
    habits_weight = db.Column(db.Float, default=0.15)
    relationship_weight = db.Column(db.Float, default=0.1)
    
    # Metadata
    total_likes = db.Column(db.Integer, default=0)
    total_passes = db.Column(db.Integer, default=0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='preference', lazy='joined')
    
    def __repr__(self):
        return f'<UserPreference user_id={self.user_id}>'
    
    def get_preference_vector(self) -> dict:
        """Get preference vector as dictionary"""
        return json.loads(self.preference_vector) if self.preference_vector else {}
    
    def set_preference_vector(self, vector: dict):
        """Set preference vector from dictionary"""
        self.preference_vector = json.dumps(vector)
    
    def get_weights(self) -> dict:
        """Get weights as dictionary"""
        return {
            'age': self.age_weight,
            'distance': self.distance_weight,
            'interests': self.interests_weight,
            'habits': self.habits_weight,
            'relationship': self.relationship_weight
        }
    
    def update_weights(self, weights: dict):
        """Update weights from dictionary"""
        self.age_weight = weights.get('age', self.age_weight)
        self.distance_weight = weights.get('distance', self.distance_weight)
        self.interests_weight = weights.get('interests', self.interests_weight)
        self.habits_weight = weights.get('habits', self.habits_weight)
        self.relationship_weight = weights.get('relationship', self.relationship_weight)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'preference_vector': self.get_preference_vector(),
            'weights': self.get_weights(),
            'total_likes': self.total_likes,
            'total_passes': self.total_passes,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }