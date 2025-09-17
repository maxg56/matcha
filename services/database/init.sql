-- DROP SCHEMA public CASCADE;
CREATE SCHEMA IF NOT EXISTS public;
SET search_path TO public;

-- ====================
-- RESET DES TABLES
-- ====================
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS discussion CASCADE;
DROP TABLE IF EXISTS relations CASCADE;
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS user_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS email_verifications CASCADE;
DROP TABLE IF EXISTS password_resets CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ====================
-- ENUMS
-- ====================
CREATE TYPE gender_enum AS ENUM ('man', 'woman', 'other');
CREATE TYPE sex_pref_enum AS ENUM ('man', 'woman', 'both', 'other');

CREATE TYPE yes_no_enum AS ENUM ('yes','no');
CREATE TYPE yes_sometimes_no_enum AS ENUM ('yes','sometimes','no');

CREATE TYPE activity_level_enum AS ENUM ('low','medium','high','other');
CREATE TYPE education_level_enum AS ENUM ('high_school','bachelor','master','doctorate','other');
CREATE TYPE religion_enum AS ENUM ('christianity','islam','hinduism','buddhism','atheism','other');
CREATE TYPE relationship_type_enum AS ENUM ('friendship','short_term','long_term','life','other');
CREATE TYPE children_status_enum AS ENUM ('yes','no','other');
CREATE TYPE hair_color_enum AS ENUM ('black','brown','blonde','red','gray','white','other');
CREATE TYPE skin_color_enum AS ENUM ('white','black','brown','yellow','olive','other');
CREATE TYPE eye_color_enum AS ENUM ('brown','blue','green','hazel','gray','other');
CREATE TYPE political_view_enum AS ENUM ('left','center','right','apolitical','other');
CREATE TYPE relation_value_enum AS ENUM ('like', 'pass', 'block');

-- ====================
-- TABLE : users
-- ====================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    password_hash TEXT NOT NULL,
    birth_date DATE ,
    age INT,
    height INT,
    premium TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    alcohol_consumption yes_sometimes_no_enum,
    smoking yes_sometimes_no_enum,
    cannabis yes_sometimes_no_enum,
    drugs yes_sometimes_no_enum,
    pets yes_no_enum,

    social_activity_level activity_level_enum,
    sport_activity activity_level_enum,
    education_level education_level_enum,

    personal_opinion TEXT,
    bio VARCHAR(400),

    birth_city VARCHAR(100),
    current_city VARCHAR(100),
    job VARCHAR(100),
    religion religion_enum,
    relationship_type relationship_type_enum ,
    children_status children_status_enum,
    children_details TEXT,

    zodiac_sign VARCHAR(50),

    hair_color hair_color_enum,
    skin_color skin_color_enum,
    eye_color eye_color_enum,

    fame INT DEFAULT 0,
    gender gender_enum NOT NULL,
    sex_pref sex_pref_enum DEFAULT 'both' NOT NULL,

    political_view political_view_enum,

    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- TABLE : email_verifications
-- ====================
CREATE TABLE email_verifications (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_verifications_email ON email_verifications(email);

-- ====================
-- TABLE : password_resets
-- ====================
CREATE TABLE password_resets (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_expires_at ON password_resets(expires_at);

-- ====================
-- TABLE : tags
-- ====================
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- ====================
-- TABLE : user_tags
-- ====================
CREATE TABLE user_tags (
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, tag_id)
);

-- ====================
-- TABLE : images
-- ====================
CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL UNIQUE,
    original_name VARCHAR(255),
    file_size INT,
    mime_type VARCHAR(100),
    width INT,
    height INT,
    is_profile BOOLEAN DEFAULT FALSE,
    file_path VARCHAR(500) NOT NULL,      -- full file path on disk
    is_active BOOLEAN DEFAULT TRUE,       -- soft delete flag
    description TEXT,                     -- optional description
    alt_text VARCHAR(255),                -- accessibility alt text
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ====================
-- MATCHING SYSTEM TABLES
-- ====================

-- Table to store user preferences for matching (learned preference vector)
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    age REAL DEFAULT 0.5,
    height REAL DEFAULT 0.5,
    fame REAL DEFAULT 0.5,
    alcohol_consumption REAL DEFAULT 0.5,
    smoking REAL DEFAULT 0.5,
    cannabis REAL DEFAULT 0.5,
    drugs REAL DEFAULT 0.5,
    pets REAL DEFAULT 0.5,
    social_activity_level REAL DEFAULT 0.5,
    sport_activity REAL DEFAULT 0.5,
    education_level REAL DEFAULT 0.5,
    religion REAL DEFAULT 0.5,
    children_status REAL DEFAULT 0.5,
    political_view REAL DEFAULT 0.5,
    latitude REAL DEFAULT 0.5,
    longitude REAL DEFAULT 0.5,
    update_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to track user interactions
CREATE TABLE IF NOT EXISTS user_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'pass', 'block')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate interactions
    CONSTRAINT unique_user_interaction UNIQUE (user_id, target_user_id)
);

-- Table for mutual matches
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Ensure consistent ordering and uniqueness
    CONSTRAINT user_order_check CHECK (user1_id < user2_id),
    CONSTRAINT unique_match UNIQUE (user1_id, user2_id)
);

-- ====================
-- TABLE : profile_views
-- ====================
CREATE TABLE profile_views (
    id SERIAL PRIMARY KEY,
    viewer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- TABLE : discussion
-- ====================
CREATE TABLE discussion (
    id SERIAL PRIMARY KEY,
    user1_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_content TEXT,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ====================
-- TABLE : messages
-- ====================
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conv_id INT NOT NULL REFERENCES discussion(id) ON DELETE CASCADE,
    sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    msg TEXT NOT NULL,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- ====================
-- TABLE : notifications
-- ====================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    to_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notif_type VARCHAR(10) NOT NULL,
    msg TEXT NOT NULL,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ====================
-- TRIGGERS
-- ====================
DROP TRIGGER IF EXISTS trg_update_last_message ON messages;
DROP FUNCTION IF EXISTS update_last_message;

CREATE OR REPLACE FUNCTION update_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE discussion
    SET last_message_content = NEW.msg,
        last_message_at = NEW.time
    WHERE id = NEW.conv_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_last_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_last_message();


CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_images_updated_at
BEFORE UPDATE ON images
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_email_verifications_updated_at
BEFORE UPDATE ON email_verifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE OR REPLACE FUNCTION set_user_age()
RETURNS TRIGGER AS $$
BEGIN
    NEW.age := DATE_PART('year', AGE(CURRENT_DATE, NEW.birth_date));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_user_age
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
WHEN (NEW.birth_date IS NOT NULL)
EXECUTE FUNCTION set_user_age();

-- Trigger for user preferences updated_at
CREATE TRIGGER trg_update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for profile views (no updated_at field, so no trigger needed)

-- ====================
-- INSERTS DE TEST
-- ====================
INSERT INTO tags (name) VALUES
('🌍 Voyage'),
('🍳 Cuisine'),
('🚴🏻‍♂️ Sport'),
('🏋️ Fitness'),
('🎮 Jeux vidéo'),
('📚 Lecture'),
('🎶 Musique'),
('🎨 Art & Créativité'),
('🐶 Amoureux des animaux'),
('🌱 Écologie & nature'),
('🎥 Cinéma & séries'),
('💃 Danse'),
('📷 Photographie'),
('🚀 Tech & innovation'),
('🍷 Gastronomie & vin'),
('👨🏻‍💻 Code avec vim'),
('⛰️ Randonnée & plein air');

-- ====================
-- INDEXES FOR MATCHING PERFORMANCE
-- ====================

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_last_updated ON user_preferences(last_updated);

-- User interactions indexes
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_target_user_id ON user_interactions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_target ON user_interactions(user_id, target_user_id);

-- Matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_is_active ON matches(is_active);
CREATE INDEX IF NOT EXISTS idx_matches_matched_at ON matches(matched_at);

-- Additional user indexes for matching
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_users_age_gender ON users(age, gender);
CREATE INDEX IF NOT EXISTS idx_users_gender_sex_pref ON users(gender, sex_pref);
CREATE INDEX IF NOT EXISTS idx_users_fame ON users(fame);

-- Profile views indexes
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_id ON profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_id ON profile_views(viewed_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_created_at ON profile_views(created_at);

-- ====================
-- ANALYTICAL VIEWS FOR MATCHING
-- ====================

-- User interaction statistics
CREATE OR REPLACE VIEW user_interaction_stats AS
SELECT 
    u.id as user_id,
    u.username,
    u.first_name,
    u.gender,
    u.age,
    u.fame,
    COUNT(CASE WHEN ui.interaction_type = 'like' THEN 1 END) as likes_given,
    COUNT(CASE WHEN ui.interaction_type = 'pass' THEN 1 END) as passes_given,
    COUNT(CASE WHEN ui.interaction_type = 'block' THEN 1 END) as blocks_given,
    COUNT(CASE WHEN ui2.interaction_type = 'like' THEN 1 END) as likes_received,
    COUNT(CASE WHEN ui2.interaction_type = 'pass' THEN 1 END) as passes_received,
    COUNT(CASE WHEN ui2.interaction_type = 'block' THEN 1 END) as blocks_received,
    u.created_at as joined_at
FROM users u
LEFT JOIN user_interactions ui ON u.id = ui.user_id
LEFT JOIN user_interactions ui2 ON u.id = ui2.target_user_id
GROUP BY u.id, u.username, u.first_name, u.gender, u.age, u.fame, u.created_at;

-- Active matches with user details
CREATE OR REPLACE VIEW active_matches_detailed AS
SELECT 
    m.id as match_id,
    m.matched_at,
    u1.id as user1_id,
    u1.username as user1_username,
    u1.first_name as user1_first_name,
    u1.age as user1_age,
    u2.id as user2_id,
    u2.username as user2_username,
    u2.first_name as user2_first_name,
    u2.age as user2_age,
    -- Calculate days since match
    EXTRACT(DAY FROM NOW() - m.matched_at) as days_since_match
FROM matches m
JOIN users u1 ON m.user1_id = u1.id
JOIN users u2 ON m.user2_id = u2.id
WHERE m.is_active = TRUE
ORDER BY m.matched_at DESC;

-- ====================
-- TABLE : user_seen_profiles
-- ====================
-- Table to track which profiles a user has already seen to prevent duplicates
CREATE TABLE IF NOT EXISTS user_seen_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seen_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    algorithm_type VARCHAR(50) DEFAULT 'unknown',
    seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, seen_user_id)
);

-- Indexes for user_seen_profiles
CREATE INDEX IF NOT EXISTS idx_user_seen_profiles_user_id ON user_seen_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_seen_profiles_seen_user_id ON user_seen_profiles(seen_user_id);
CREATE INDEX IF NOT EXISTS idx_user_seen_profiles_user_seen ON user_seen_profiles(user_id, seen_user_id);

-- Trigger for user_seen_profiles
CREATE TRIGGER trg_update_user_seen_profiles_seen_at
BEFORE UPDATE ON user_seen_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
