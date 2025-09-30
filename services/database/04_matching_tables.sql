-- ====================
-- MATCHING SYSTEM TABLES
-- ====================

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
-- TABLE : user_matching_preferences
-- ====================
CREATE TABLE IF NOT EXISTS user_matching_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    age_min INTEGER DEFAULT 18,
    age_max INTEGER DEFAULT 99,
    max_distance NUMERIC(10,2) DEFAULT 50.0,
    min_fame INTEGER DEFAULT 0,
    preferred_genders TEXT NOT NULL DEFAULT '["man","woman","other"]',
    required_tags TEXT DEFAULT '[]',
    blocked_tags TEXT DEFAULT '[]',

    -- Lifestyle preferences
    smoking_preference VARCHAR(20) DEFAULT 'any',      -- "any", "smoker", "non_smoker"
    alcohol_preference VARCHAR(20) DEFAULT 'any',      -- "any", "drinker", "non_drinker"
    drugs_preference VARCHAR(20) DEFAULT 'any',        -- "any", "user", "non_user"
    cannabis_preference VARCHAR(20) DEFAULT 'any',     -- "any", "user", "non_user"

    -- Religious preferences
    religion_preference VARCHAR(20) DEFAULT 'any',     -- "any", "same", "different"
    blocked_religions TEXT DEFAULT '[]',               -- JSON array of blocked religions

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure unique preferences per user
    CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

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