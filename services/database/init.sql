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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- TABLE : relations
-- ====================
CREATE TABLE relations (
    id SERIAL PRIMARY KEY,
    user1_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    value_user1 relation_value_enum DEFAULT 'pass' NOT NULL,
    value_user2 relation_value_enum DEFAULT 'pass' NOT NULL
);

-- ====================
-- TABLE : discussion
-- ====================
CREATE TABLE discussion (
    id SERIAL PRIMARY KEY,
    user1_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_content TEXT,
    last_message_at TIMESTAMP
);

-- ====================
-- TABLE : messages
-- ====================
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conv_id INT NOT NULL REFERENCES discussion(id) ON DELETE CASCADE,
    sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
