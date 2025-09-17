-- Table pour les préférences de matching classiques (user-service)
-- Séparée de la table user_preferences utilisée par le match-service

CREATE TABLE IF NOT EXISTS user_matching_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    age_min INTEGER DEFAULT 18,
    age_max INTEGER DEFAULT 99,
    max_distance REAL DEFAULT 50,
    min_fame INTEGER DEFAULT 0,
    preferred_genders TEXT NOT NULL DEFAULT '["man","woman","other"]', -- JSON array of genders
    required_tags TEXT DEFAULT '[]', -- JSON array of tag names
    blocked_tags TEXT DEFAULT '[]', -- JSON array of tag names
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_matching_preferences_user_id ON user_matching_preferences(user_id);

-- Trigger pour updated_at
CREATE TRIGGER trg_update_user_matching_preferences_updated_at
BEFORE UPDATE ON user_matching_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();