"""
Test configuration that uses SQLite instead of PostgreSQL
"""
import tempfile
from app import create_app
from models import db
from config.database import create_tables


def create_test_app():
    """Create Flask app configured for testing"""
    config = {
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'UPLOAD_FOLDER': tempfile.mkdtemp()
    }
    
    app = create_app(config)
    
    # Initialize database within app context
    with app.app_context():
        create_tables(db)
    
    return app


if __name__ == '__main__':
    # For direct testing - just create the test app to verify it works
    test_app = create_test_app()
    print("Test app created successfully!")