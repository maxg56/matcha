import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, text

# Initialize SQLAlchemy instance
db = SQLAlchemy()

def get_database_url():
    """Get database URL from environment variables"""
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('DB_NAME', 'matcha_dev')
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', 'password')
    
    return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

def init_db(app):
    """Initialize database with Flask app"""
    app.config['SQLALCHEMY_DATABASE_URI'] = get_database_url()
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize SQLAlchemy with app
    db.init_app(app)
    
    return db

def test_connection():
    """Test database connection"""
    try:
        engine = create_engine(get_database_url())
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            return result.fetchone() is not None
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False