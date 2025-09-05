from datetime import datetime
from app.config.database import db

class UserTag(db.Model):
    """Many-to-many relationship between users and tags"""
    __tablename__ = 'user_tags'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    tag_id = db.Column(db.Integer, db.ForeignKey('tags.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', back_populates='tags')
    tag = db.relationship('Tag', back_populates='user_tags')
    
    # Unique constraint to prevent duplicate user-tag combinations
    __table_args__ = (db.UniqueConstraint('user_id', 'tag_id', name='unique_user_tag'),)
    
    def __repr__(self):
        return f'<UserTag user_id={self.user_id} tag_id={self.tag_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'tag_id': self.tag_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }