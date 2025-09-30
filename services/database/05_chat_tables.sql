-- ====================
-- CHAT SYSTEM TABLES
-- ====================

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
-- TABLE : message_reactions
-- ====================
DROP TABLE IF EXISTS message_reactions CASCADE;

CREATE TABLE message_reactions (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_message
        FOREIGN KEY (message_id)
        REFERENCES messages(id)
        ON DELETE CASCADE
);