-- Migration script for match-service database tables
-- Run this script to create the necessary tables for the vector matching algorithm

-- Table to store user preference vectors and weights
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    preference_vector TEXT NOT NULL, -- JSON string storing the preference vector
    age_weight REAL DEFAULT 0.2,
    distance_weight REAL DEFAULT 0.3,
    interests_weight REAL DEFAULT 0.25,
    habits_weight REAL DEFAULT 0.15,
    relationship_weight REAL DEFAULT 0.1,
    total_likes INTEGER DEFAULT 0,
    total_passes INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast user lookup
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_last_updated ON user_preferences(last_updated);

-- Table to track user interactions (likes, passes, blocks)
CREATE TABLE IF NOT EXISTS user_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'pass', 'block')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate interactions between same users
    CONSTRAINT unique_user_interaction UNIQUE (user_id, target_user_id)
);

-- Indexes for fast interaction lookups
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_target_user_id ON user_interactions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at);

-- Table to store mutual matches
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Ensure user1_id < user2_id for consistency
    CONSTRAINT user_order_check CHECK (user1_id < user2_id),
    -- Prevent duplicate matches
    CONSTRAINT unique_match UNIQUE (user1_id, user2_id)
);

-- Indexes for fast match lookups
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_is_active ON matches(is_active);
CREATE INDEX IF NOT EXISTS idx_matches_matched_at ON matches(matched_at);

-- Function to automatically update last_updated timestamp
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update last_updated on user_preferences
DROP TRIGGER IF EXISTS update_user_preferences_last_updated ON user_preferences;
CREATE TRIGGER update_user_preferences_last_updated
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_column();

-- Add some useful views for analytics

-- View to get user interaction statistics
CREATE OR REPLACE VIEW user_interaction_stats AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(CASE WHEN ui.interaction_type = 'like' THEN 1 END) as likes_given,
    COUNT(CASE WHEN ui.interaction_type = 'pass' THEN 1 END) as passes_given,
    COUNT(CASE WHEN ui.interaction_type = 'block' THEN 1 END) as blocks_given,
    COUNT(CASE WHEN ui2.interaction_type = 'like' THEN 1 END) as likes_received,
    COUNT(CASE WHEN ui2.interaction_type = 'pass' THEN 1 END) as passes_received,
    COUNT(CASE WHEN ui2.interaction_type = 'block' THEN 1 END) as blocks_received
FROM users u
LEFT JOIN user_interactions ui ON u.id = ui.user_id
LEFT JOIN user_interactions ui2 ON u.id = ui2.target_user_id
GROUP BY u.id, u.username;

-- View to get active matches with user details
CREATE OR REPLACE VIEW active_matches_detailed AS
SELECT 
    m.id as match_id,
    m.matched_at,
    u1.id as user1_id,
    u1.username as user1_username,
    u1.first_name as user1_first_name,
    u2.id as user2_id,
    u2.username as user2_username,
    u2.first_name as user2_first_name
FROM matches m
JOIN users u1 ON m.user1_id = u1.id
JOIN users u2 ON m.user2_id = u2.id
WHERE m.is_active = TRUE
ORDER BY m.matched_at DESC;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON user_preferences TO match_service_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON user_interactions TO match_service_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON matches TO match_service_user;
-- GRANT SELECT ON user_interaction_stats TO match_service_user;
-- GRANT SELECT ON active_matches_detailed TO match_service_user;
-- GRANT USAGE ON SEQUENCE user_preferences_id_seq TO match_service_user;
-- GRANT USAGE ON SEQUENCE user_interactions_id_seq TO match_service_user;
-- GRANT USAGE ON SEQUENCE matches_id_seq TO match_service_user;