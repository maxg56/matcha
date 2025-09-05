from datetime import datetime
from app.config.database import db
from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid

class User(db.Model):
    """User model matching the existing users table structure"""
    __tablename__ = 'users'
    
    # Primary fields
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    birth_date = db.Column(db.Date, nullable=False)
    age = db.Column(db.Integer)
    height = db.Column(db.Integer)
    
    # Lifestyle attributes
    alcohol_consumption = db.Column(db.String(20))  # yes/sometimes/no
    smoking = db.Column(db.String(20))              # yes/sometimes/no
    cannabis = db.Column(db.String(20))             # yes/sometimes/no
    drugs = db.Column(db.String(20))                # yes/no
    pets = db.Column(db.String(20))                 # yes/no
    
    # Activity levels
    social_activity_level = db.Column(db.String(20))  # low/medium/high
    sport_activity = db.Column(db.String(20))          # low/medium/high
    education_level = db.Column(db.String(50))
    
    # Personal info
    personal_opinion = db.Column(db.Text)
    bio = db.Column(db.String(400))
    birth_city = db.Column(db.String(100))
    current_city = db.Column(db.String(100))
    job = db.Column(db.String(100))
    religion = db.Column(db.String(50))
    relationship_type = db.Column(db.String(50), nullable=False)
    children_status = db.Column(db.String(50))
    children_details = db.Column(db.Text)
    zodiac_sign = db.Column(db.String(20))
    
    # Physical attributes
    hair_color = db.Column(db.String(20))
    skin_color = db.Column(db.String(20))
    eye_color = db.Column(db.String(20))
    
    # Social metrics
    fame = db.Column(db.Integer, default=0)
    gender = db.Column(db.String(20), nullable=False)
    sex_pref = db.Column(db.String(20), nullable=False, default='both')
    political_view = db.Column(db.String(50))
    
    # Location
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships (for joins with other tables)
    tags = db.relationship('UserTag', back_populates='user', lazy='dynamic')
    images = db.relationship('Image', back_populates='user', lazy='dynamic')
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def to_dict(self):
        """Convert user to dictionary for API responses"""
        return {
            'id': self.id,
            'username': self.username,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'age': self.age,
            'height': self.height,
            'alcohol_consumption': self.alcohol_consumption,
            'smoking': self.smoking,
            'cannabis': self.cannabis,
            'drugs': self.drugs,
            'pets': self.pets,
            'social_activity_level': self.social_activity_level,
            'sport_activity': self.sport_activity,
            'education_level': self.education_level,
            'bio': self.bio,
            'current_city': self.current_city,
            'job': self.job,
            'religion': self.religion,
            'relationship_type': self.relationship_type,
            'children_status': self.children_status,
            'zodiac_sign': self.zodiac_sign,
            'hair_color': self.hair_color,
            'skin_color': self.skin_color,
            'eye_color': self.eye_color,
            'fame': self.fame,
            'gender': self.gender,
            'sex_pref': self.sex_pref,
            'political_view': self.political_view,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def to_matrix_dict(self):
        """Convert user to dictionary suitable for matrix calculations"""
        from config.enum_mapping import encode_enum_value
        
        return {
            'id': float(self.id),
            'age': float(self.age) if self.age else 0.0,
            'height': float(self.height) if self.height else 0.0,
            'fame': float(self.fame) if self.fame else 0.0,
            'alcohol_consumption': encode_enum_value('alcohol_consumption', self.alcohol_consumption),
            'smoking': encode_enum_value('smoking', self.smoking),
            'cannabis': encode_enum_value('cannabis', self.cannabis),
            'drugs': encode_enum_value('drugs', self.drugs),
            'pets': encode_enum_value('pets', self.pets),
            'social_activity_level': encode_enum_value('social_activity_level', self.social_activity_level),
            'sport_activity': encode_enum_value('sport_activity', self.sport_activity),
            'education_level': encode_enum_value('education_level', self.education_level),
            'religion': encode_enum_value('religion', self.religion),
            'relationship_type': encode_enum_value('relationship_type', self.relationship_type),
            'children_status': encode_enum_value('children_status', self.children_status),
            'hair_color': encode_enum_value('hair_color', self.hair_color),
            'skin_color': encode_enum_value('skin_color', self.skin_color),
            'eye_color': encode_enum_value('eye_color', self.eye_color),
            'zodiac_sign': encode_enum_value('zodiac_sign', self.zodiac_sign),
            'gender': encode_enum_value('gender', self.gender),
            'sex_pref': encode_enum_value('sex_pref', self.sex_pref),
            'political_view': encode_enum_value('political_view', self.political_view),
            'latitude': float(self.latitude) if self.latitude else 0.0,
            'longitude': float(self.longitude) if self.longitude else 0.0
        }