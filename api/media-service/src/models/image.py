"""
Model pour les images/médias stockés
"""

from datetime import datetime, timezone

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, String, Text
import enum

db = SQLAlchemy()


class ImageVisibility(enum.Enum):
    """Enum pour la visibilité des images"""
    PUBLIC = "public"
    PRIVATE = "private"
    FRIENDS_ONLY = "friends_only"


class Image(db.Model):
    """
    Modèle pour les images/médias
    Compatible avec le modèle image existant du service auth
    """

    __tablename__ = "images"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False, index=True)
    filename = Column(
        String(255), nullable=False, unique=True
    )  # Nom de fichier unique généré
    original_name = Column(String(255), nullable=False)  # Nom original du fichier
    file_path = Column(String(500), nullable=False)  # Chemin sur le disque
    file_size = Column(Integer, nullable=False)  # Taille en bytes
    mime_type = Column(String(100), nullable=False)  # Type MIME (image/jpeg, etc.)
    width = Column(Integer, nullable=True)  # Largeur de l'image
    height = Column(Integer, nullable=True)  # Hauteur de l'image
    is_profile = Column(Boolean, default=False)  # Image de profil principale
    is_active = Column(Boolean, default=True)  # Image active/supprimée
    order_index = Column(Integer, default=0, nullable=False)  # Ordre d'affichage
    visibility = Column(Enum(ImageVisibility), default=ImageVisibility.PUBLIC, nullable=False)  # Visibilité
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Métadonnées additionnelles (optionnelles)
    description = Column(Text, nullable=True)
    alt_text = Column(String(255), nullable=True)

    def __repr__(self):
        return f"<Image {self.filename} (user {self.user_id})>"

    def to_dict(self):
        """Convertir en dictionnaire pour les réponses JSON"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "filename": self.filename,
            "original_name": self.original_name,
            "file_size": self.file_size,
            "mime_type": self.mime_type,
            "width": self.width,
            "height": self.height,
            "is_profile": self.is_profile,
            "is_active": self.is_active,
            "order_index": self.order_index,
            "visibility": self.visibility.value if self.visibility else ImageVisibility.PUBLIC.value,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "description": self.description,
            "alt_text": self.alt_text,
        }

    @classmethod
    def get_by_filename(cls, filename):
        """Récupérer une image par son nom de fichier"""
        return cls.query.filter_by(filename=filename, is_active=True).first()

    @classmethod
    def get_by_user_id(cls, user_id):
        """Récupérer toutes les images d'un utilisateur, triées par order_index"""
        return cls.query.filter_by(user_id=user_id, is_active=True).order_by(cls.order_index).all()

    def soft_delete(self):
        """Suppression logique (marquer comme inactive)"""
        self.is_active = False
        self.updated_at = datetime.now(timezone.utc)
        db.session.commit()

    def set_as_profile(self):
        """Définir comme image de profil (désactiver les autres)"""
        # Désactiver toutes les autres images de profil de l'utilisateur
        Image.query.filter_by(user_id=self.user_id, is_profile=True).update(
            {"is_profile": False}
        )
        self.is_profile = True
        db.session.commit()

    def update_metadata(self, description=None, alt_text=None, visibility=None):
        """Mettre à jour les métadonnées de l'image"""
        if description is not None:
            self.description = description
        if alt_text is not None:
            self.alt_text = alt_text
        if visibility is not None:
            if isinstance(visibility, str):
                visibility = ImageVisibility(visibility)
            self.visibility = visibility
        self.updated_at = datetime.now(timezone.utc)
        db.session.commit()

    @classmethod
    def reorder_user_images(cls, user_id, image_orders):
        """
        Réorganiser les images d'un utilisateur
        image_orders: liste de dictionnaires [{"id": 1, "order_index": 0}, ...]
        """
        try:
            for order_data in image_orders:
                image_id = order_data.get("id")
                new_order = order_data.get("order_index")

                if image_id is None or new_order is None:
                    continue

                image = cls.query.filter_by(
                    id=image_id,
                    user_id=user_id,
                    is_active=True
                ).first()

                if image:
                    image.order_index = new_order
                    image.updated_at = datetime.now(timezone.utc)

            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            raise e
