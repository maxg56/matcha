#!/usr/bin/env python3
"""
Database management script for Media Service
"""
import logging

from app import create_app
from config.database import create_tables, test_connection
from models import Image, db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db():
    """Initialize database tables"""
    app = create_app()

    with app.app_context():
        logger.info("Testing database connection...")
        if not test_connection():
            logger.error("Database connection failed!")
            return False

        logger.info("Creating database tables...")
        try:
            create_tables(db)
            logger.info("✅ Database initialized successfully!")
            return True
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")
            return False


def drop_db():
    """Drop all database tables"""
    app = create_app()

    with app.app_context():
        logger.warning("⚠️ Dropping all database tables...")
        try:
            db.drop_all()
            logger.info("✅ Database tables dropped successfully!")
            return True
        except Exception as e:
            logger.error(f"❌ Database drop failed: {e}")
            return False


def reset_db():
    """Reset database (drop and recreate)"""
    logger.info("🔄 Resetting database...")
    if drop_db() and init_db():
        logger.info("✅ Database reset completed!")
        return True
    return False


def check_db():
    """Check database status and show table info"""
    app = create_app()

    with app.app_context():
        logger.info("🔍 Checking database status...")

        if not test_connection():
            logger.error("❌ Database connection failed!")
            return False

        try:
            # Check if tables exist and get counts
            images_count = Image.query.count()

            logger.info("📊 Database Status:")
            logger.info(f"  - Images table: {images_count} records")

            # Show some sample data
            recent_images = Image.query.filter_by(is_active=True).limit(5).all()
            if recent_images:
                logger.info("  - Recent images:")
                for img in recent_images:
                    logger.info(
                        f"    * {img.filename} (user {img.user_id}) - {img.file_size} bytes"
                    )

            return True

        except Exception as e:
            logger.error(f"❌ Database check failed: {e}")
            return False


def main():
    """Main CLI interface"""
    import sys

    if len(sys.argv) < 2:
        print("Usage: python manage.py <command>")
        print("Commands:")
        print("  init    - Initialize database tables")
        print("  drop    - Drop all database tables")
        print("  reset   - Reset database (drop + init)")
        print("  check   - Check database status")
        sys.exit(1)

    command = sys.argv[1].lower()

    if command == "init":
        success = init_db()
    elif command == "drop":
        success = drop_db()
    elif command == "reset":
        success = reset_db()
    elif command == "check":
        success = check_db()
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
