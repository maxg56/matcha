from datetime import datetime
from app.config.database import db

class UserInteraction(db.Model):
    """Track user interactions (likes, passes, blocks) for matching algorithm"""
    __tablename__ = 'user_interactions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    target_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    interaction_type = db.Column(db.String(20), nullable=False)  # 'like', 'pass', 'block'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='interactions_made')
    target_user = db.relationship('User', foreign_keys=[target_user_id], backref='interactions_received')
    
    # Unique constraint to prevent duplicate interactions
    __table_args__ = (
        db.UniqueConstraint('user_id', 'target_user_id', name='unique_user_interaction'),
        db.Index('idx_user_interactions_user_id', 'user_id'),
        db.Index('idx_user_interactions_target_user_id', 'target_user_id'),
        db.Index('idx_user_interactions_type', 'interaction_type')
    )
    
    def __repr__(self):
        return f'<UserInteraction {self.user_id} -> {self.target_user_id} ({self.interaction_type})>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'target_user_id': self.target_user_id,
            'interaction_type': self.interaction_type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Match(db.Model):
    """Track mutual likes (matches) between users"""
    __tablename__ = 'matches'
    
    id = db.Column(db.Integer, primary_key=True)
    user1_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user2_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    matched_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    user1 = db.relationship('User', foreign_keys=[user1_id], backref='matches_as_user1')
    user2 = db.relationship('User', foreign_keys=[user2_id], backref='matches_as_user2')
    
    # Unique constraint and ensure user1_id < user2_id for consistency
    __table_args__ = (
        db.UniqueConstraint('user1_id', 'user2_id', name='unique_match'),
        db.CheckConstraint('user1_id < user2_id', name='user_order_check'),
        db.Index('idx_matches_user1', 'user1_id'),
        db.Index('idx_matches_user2', 'user2_id')
    )
    
    def __repr__(self):
        return f'<Match {self.user1_id} <-> {self.user2_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user1_id': self.user1_id,
            'user2_id': self.user2_id,
            'matched_at': self.matched_at.isoformat() if self.matched_at else None,
            'is_active': self.is_active
        }