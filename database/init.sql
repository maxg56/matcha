-- ====================
-- TABLE : users
-- ====================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    fame INT DEFAULT 0,
    gender VARCHAR(5) NOT NULL CHECK (gender IN ('woman', 'man')),
    sex_pref VARCHAR(5) DEFAULT 'both' NOT NULL CHECK (sex_pref IN ('woman', 'man', 'both')),
    bio VARCHAR(400),
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6)
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
    PRIMARY KEY (user_id, tag_id) -- clé composite pour éviter les doublons
);

-- ====================
-- TABLE : images
-- ====================
CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image VARCHAR(255) NOT NULL,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- TABLE : relation
-- ====================
CREATE TABLE relations (
    id SERIAL PRIMARY KEY,
    user1_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    value_user1 INT, -- 0=like, 1=not like, 2=block
    value_user2 INT -- 0=like, 1=not like, 2=block
    value_user1 VARCHAR(5) DEFAULT 'both' NOT NULL CHECK (sex_pref IN ('like', 'pass', 'block')),
    value_user2 VARCHAR(5) DEFAULT 'both' NOT NULL CHECK (sex_pref IN ('like', 'pass', 'block')),
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
    msg TINYTEXT NOT NULL,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- TRIGGER : Mise à jour du last message
-- ====================
-- Fonction qui met à jour la discussion
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

-- Déclencheur sur insertion de message
CREATE TRIGGER trg_update_last_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_last_message();


INSERT INTO users (username, first_name, last_name, email, gender, sex_pref)
VALUES
('test1', 'T', 'tester', 't@t.com', 'man', 'both'),
('test2', 'te', 'tes', 'tes@t.com', 'woman', 'man');

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
-- SELECT t.name FROM tags t JOIN user_tags ut ON t.id = ut.tag_id WHERE ut.user_id = 1;