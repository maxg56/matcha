"""
Model pour les images/médias stockés
"""
from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text

db = SQLAlchemy()


class Image(db.Model):
    """
    Modèle pour les images/médias
    Compatible avec le modèle image existant du service auth
    """
    __tablename__ = 'images'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False, index=True)
    filename = Column(String(255), nullable=False, unique=True)  # Nom de fichier unique généré
    original_name = Column(String(255), nullable=False)  # Nom original du fichier
    file_path = Column(String(500), nullable=False)  # Chemin sur le disque
    file_size = Column(Integer, nullable=False)  # Taille en bytes
    mime_type = Column(String(100), nullable=False)  # Type MIME (image/jpeg, etc.)
    width = Column(Integer, nullable=True)  # Largeur de l'image
    height = Column(Integer, nullable=True)  # Hauteur de l'image
    is_profile = Column(Boolean, default=False)  # Image de profil principale
    is_active = Column(Boolean, default=True)  # Image active/supprimée
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Métadonnées additionnelles (optionnelles)
    description = Column(Text, nullable=True)
    alt_text = Column(String(255), nullable=True)
    
    def __repr__(self):
        return f'<Image {self.filename} (user {self.user_id})>'
    
    def to_dict(self):
        """Convertir en dictionnaire pour les réponses JSON"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'filename': self.filename,
            'original_name': self.original_name,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'width': self.width,
            'height': self.height,
            'is_profile': self.is_profile,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'description': self.description,
            'alt_text': self.alt_text
        }
    
    @classmethod
    def get_by_filename(cls, filename):
        """Récupérer une image par son nom de fichier"""
        return cls.query.filter_by(filename=filename, is_active=True).first()
    
    @classmethod
    def get_by_user_id(cls, user_id):
        """Récupérer toutes les images d'un utilisateur"""
        return cls.query.filter_by(user_id=user_id, is_active=True).all()
    
    def soft_delete(self):
        """Suppression logique (marquer comme inactive)"""
        self.is_active = False
        self.updated_at = datetime.now(timezone.utc)
        db.session.commit()
    
    def set_as_profile(self):
        """Définir comme image de profil (désactiver les autres)"""
        # Désactiver toutes les autres images de profil de l'utilisateur
        Image.query.filter_by(user_id=self.user_id, is_profile=True).update({'is_profile': False})
        self.is_profile = True
        db.session.commit()