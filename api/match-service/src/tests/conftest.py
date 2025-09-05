import pytest
import tempfile
import os
from app import create_app
from app.config.database import db
from app.models import User, UserPreference, UserInteraction, Match
from datetime import datetime, date

@pytest.fixture
def app():
    """Create application for testing"""
    # Create temporary database
    db_fd, db_path = tempfile.mkstemp()
    
    # Override config for testing
    test_config = {
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': f'sqlite:///{db_path}',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'WTF_CSRF_ENABLED': False,
        'ENABLE_CACHING': False,
        'RATE_LIMIT_ENABLED': False
    }
    
    app = create_app()
    app.config.update(test_config)
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()
    
    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()

@pytest.fixture
def runner(app):
    """Create test runner"""
    return app.test_cli_runner()

@pytest.fixture
def sample_users(app):
    """Create sample users for testing"""
    with app.app_context():
        users = []
        
        # User 1: Male, 25, likes females
        user1 = User(
            username='john_doe',
            first_name='John',
            last_name='Doe',
            email='john@example.com',
            password_hash='hashed_password',
            birth_date=date(1999, 1, 1),
            age=25,
            height=175,
            gender='male',
            sex_pref='female',
            fame=10,
            latitude=48.856613,
            longitude=2.352222,
            alcohol_consumption='sometimes',
            smoking='no',
            cannabis='no',
            education_level='university',
            relationship_type='single'
        )
        
        # User 2: Female, 23, likes males
        user2 = User(
            username='jane_smith',
            first_name='Jane',
            last_name='Smith',
            email='jane@example.com',
            password_hash='hashed_password',
            birth_date=date(2001, 6, 15),
            age=23,
            height=165,
            gender='female',
            sex_pref='male',
            fame=15,
            latitude=48.866613,
            longitude=2.362222,
            alcohol_consumption='yes',
            smoking='no',
            cannabis='sometimes',
            education_level='secondary',
            relationship_type='single'
        )
        
        # User 3: Male, 30, likes both
        user3 = User(
            username='alex_wilson',
            first_name='Alex',
            last_name='Wilson',
            email='alex@example.com',
            password_hash='hashed_password',
            birth_date=date(1994, 3, 20),
            age=30,
            height=180,
            gender='male',
            sex_pref='both',
            fame=20,
            latitude=48.876613,
            longitude=2.372222,
            alcohol_consumption='no',
            smoking='yes',
            cannabis='no',
            education_level='university',
            relationship_type='single'
        )
        
        # User 4: Female, 28, likes females
        user4 = User(
            username='sarah_jones',
            first_name='Sarah',
            last_name='Jones',
            email='sarah@example.com',
            password_hash='hashed_password',
            birth_date=date(1996, 12, 5),
            age=28,
            height=170,
            gender='female',
            sex_pref='female',
            fame=8,
            latitude=48.846613,
            longitude=2.342222,
            alcohol_consumption='sometimes',
            smoking='no',
            cannabis='no',
            education_level='university',
            relationship_type='single'
        )
        
        users = [user1, user2, user3, user4]
        
        for user in users:
            db.session.add(user)
        
        db.session.commit()
        
        # Refresh users to get IDs
        for user in users:
            db.session.refresh(user)
        
        return users

@pytest.fixture
def sample_preferences(app, sample_users):
    """Create sample user preferences"""
    with app.app_context():
        preferences = []
        
        for user in sample_users:
            # Create preference vector based on user's attributes
            preference_vector = [0.5] * 20  # Simple vector for testing
            
            pref = UserPreference(
                user_id=user.id,
                preference_vector=str(preference_vector),
                total_likes=0,
                total_passes=0
            )
            preferences.append(pref)
            db.session.add(pref)
        
        db.session.commit()
        return preferences

@pytest.fixture
def sample_interactions(app, sample_users):
    """Create sample user interactions"""
    with app.app_context():
        interactions = []
        
        # User 1 likes User 2
        interaction1 = UserInteraction(
            user_id=sample_users[0].id,
            target_user_id=sample_users[1].id,
            interaction_type='like'
        )
        
        # User 2 likes User 1 (creates match)
        interaction2 = UserInteraction(
            user_id=sample_users[1].id,
            target_user_id=sample_users[0].id,
            interaction_type='like'
        )
        
        # User 3 passes User 4
        interaction3 = UserInteraction(
            user_id=sample_users[2].id,
            target_user_id=sample_users[3].id,
            interaction_type='pass'
        )
        
        interactions = [interaction1, interaction2, interaction3]
        
        for interaction in interactions:
            db.session.add(interaction)
        
        db.session.commit()
        return interactions

@pytest.fixture
def sample_match(app, sample_users):
    """Create a sample match"""
    with app.app_context():
        match = Match(
            user1_id=min(sample_users[0].id, sample_users[1].id),
            user2_id=max(sample_users[0].id, sample_users[1].id),
            is_active=True
        )
        
        db.session.add(match)
        db.session.commit()
        return match