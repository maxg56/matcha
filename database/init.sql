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
    gender VARCHAR(50),
    sex_pref INT NOT NULL CHECK (sex_pref IN (0, 1, 2)), -- 0=bi, 1=hetero, 2=gay
    bio VARCHAR(400),
    tags TEXT
);

-- ====================
-- TABLE : images
-- ====================
CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    id_user INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image VARCHAR(255) NOT NULL
);

-- ====================
-- TABLE : relation
-- ====================
CREATE TABLE relations (
    id SERIAL PRIMARY KEY,
    id_user1 INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    id_user2 INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    value_user1 INT, -- 0=like, 1=not like, 2=block
    value_user2 INT -- 0=like, 1=not like, 2=block
);

-- ====================
-- TABLE : discussion
-- ====================
CREATE TABLE discussion (
    id SERIAL PRIMARY KEY,
    id_user1 INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    id_user2 INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
