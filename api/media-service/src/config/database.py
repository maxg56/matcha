"""
Configuration de la base de données
"""

import logging
import os

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, text

logger = logging.getLogger(__name__)


def get_database_url():
    """Construire l'URL de connexion à la base de données"""
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "password")
    dbname = os.getenv("DB_NAME", "matcha_dev")

    return f"postgresql://{user}:{password}@{host}:{port}/{dbname}"


def init_database(app):
    """Initialiser la base de données avec Flask"""
    database_url = get_database_url()

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

    logger.info(f"Database URL: {database_url}")
    return database_url


def test_connection():
    """Tester la connexion à la base de données"""
    try:
        database_url = get_database_url()
        engine = create_engine(database_url)

        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            result.fetchone()

        logger.info("✅ Connexion à la base de données réussie")
        return True

    except Exception as e:
        logger.error(f"❌ Erreur de connexion à la base de données: {e}")
        return False


def create_tables(db):
    """Créer les tables si elles n'existent pas"""
    try:
        # Créer toutes les tables définies dans les modèles
        db.create_all()
        logger.info("✅ Tables créées avec succès")

    except Exception as e:
        logger.error(f"❌ Erreur lors de la création des tables: {e}")
        raise
