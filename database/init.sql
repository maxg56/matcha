-- ====================
-- RESET DES TABLES (ordre inverse des dépendances)
-- ====================
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS discussion CASCADE;
DROP TABLE IF EXISTS relations CASCADE;
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS user_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ====================
-- TABLE : users
-- ====================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    birth_date DATE NOT NULL,
    age INT GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(birth_date))) STORED,
    height INT, -- previously 'size'

    alcohol_consumption VARCHAR(9) CHECK (alcohol_consumption IN ('yes','sometimes','no')),
    smoking VARCHAR(9) CHECK (smoking IN ('yes','sometimes','no')),
    cannabis VARCHAR(9) CHECK (cannabis IN ('yes','sometimes','no')),
    drugs VARCHAR(9) CHECK (drugs IN ('yes','sometimes','no')),
    pets VARCHAR(3)  CHECK (pets IN ('yes','no')),

    social_activity_level VARCHAR(10) CHECK (social_activity_level IN ('low','medium','high','other')),
    sport_activity VARCHAR(10) CHECK (sport_activity IN ('low','medium','high','other')),
    education_level VARCHAR(20) CHECK (education_level IN ('high_school','bachelor','master','doctorate','other')),

    personal_opinion TEXT,
    bio VARCHAR(400), -- limited to 400 characters

    birth_city VARCHAR(100),
    current_city VARCHAR(100),
    job VARCHAR(100),
    religion VARCHAR(50) CHECK (religion IN ('christianity','islam','hinduism','buddhism','atheism','other')),
    relationship_type VARCHAR(20) NOT NULL CHECK (relationship_type IN ('friendship','short_term','long_term','life','other')),
    children_status VARCHAR(10) CHECK (children_status IN ('yes','no','other')), -- new: does user have children
    children_details TEXT, -- optional: number/age of children

    zodiac_sign VARCHAR(50),

    hair_color VARCHAR(20) CHECK (hair_color IN ('black','brown','blonde','red','gray','white','other')),
    skin_color VARCHAR(20) CHECK (skin_color IN ('white','black','brown','yellow','olive','other')),
    eye_color VARCHAR(20) CHECK (eye_color IN ('brown','blue','green','hazel','gray','other')),

    fame INT DEFAULT 0,
    gender VARCHAR(6) NOT NULL CHECK (gender IN ('woman', 'man', 'other')),
    sex_pref VARCHAR(6) DEFAULT 'both' NOT NULL CHECK (sex_pref IN ('woman', 'man', 'both','other')),

    political_view VARCHAR(20) CHECK (political_view IN ('left','center','right','apolitical','other')),

    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


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
    value_user1 VARCHAR(5) DEFAULT 'both' NOT NULL CHECK (value_user1 IN ('like', 'pass', 'block')),
    value_user2 VARCHAR(5) DEFAULT 'both' NOT NULL CHECK (value_user2 IN ('like', 'pass', 'block'))
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
-- FONCTION & TRIGGER : Mise à jour du dernier message
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

-- ====================
-- TRIGGER : Mise à jour automatique de updated_at
-- ====================
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

-- ====================
-- INSERTS DE TEST
-- ====================
INSERT INTO users (username, first_name, last_name, email, password_hash, birth_date, gender, sex_pref)
VALUES
('testuser', 'Test', 'User', 'test@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1990-01-01', 'man', 'both'),
('test1', 'T', 'tester', 't@t.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1992-05-15', 'man', 'both'),
('test2', 'te', 'tes', 'tes@t.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1995-08-20', 'woman', 'man');

INSERT INTO tags (name) VALUES
('🌍 Voyage'),
('🍳 Cuisine'),
('🚴🏻​ Sport'),
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
('👨🏻‍💻​​ Code avec vim'),
('⛰️ Randonnée & plein air');

INSERT INTO user_tags (user_id, tag_id) VALUES
(1, 3), (1, 6), (1, 8),
(2, 10), (2, 3), (2, 8);

INSERT INTO discussion (user1_id, user2_id) VALUES (1, 2);

INSERT INTO messages (conv_id, sender_id, msg) VALUES
(1, 1, 'hey'),
(1, 2, 'how are you'),
(1, 1, 'fine');
