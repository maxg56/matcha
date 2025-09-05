from datetime import datetime
from app.config.database import db

class Image(db.Model):
    """Image model for user photos"""
    __tablename__ = 'images'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    filename = db.Column(db.String(255))
    is_primary = db.Column(db.Boolean, default=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', back_populates='images')
    
    def __repr__(self):
        return f'<Image {self.filename} for user {self.user_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'url': self.url,
            'filename': self.filename,
            'is_primary': self.is_primary,
            'upload_date': self.upload_date.isoformat() if self.upload_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }