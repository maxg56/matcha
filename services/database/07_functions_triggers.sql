-- ====================
-- DATABASE FUNCTIONS AND TRIGGERS
-- ====================

-- ====================
-- TRIGGERS CLEANUP
-- ====================
DROP TRIGGER IF EXISTS trg_update_last_message ON messages;
DROP FUNCTION IF EXISTS update_last_message;

-- ====================
-- FUNCTION: Update last message in discussions
-- ====================
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
-- FUNCTION: Update updated_at column
-- ====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================
-- FUNCTION: Set user age based on birth date
-- ====================
CREATE OR REPLACE FUNCTION set_user_age()
RETURNS TRIGGER AS $$
BEGIN
    NEW.age := DATE_PART('year', AGE(CURRENT_DATE, NEW.birth_date));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================
-- TRIGGERS FOR updated_at COLUMNS
-- ====================
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

CREATE TRIGGER trg_update_user_matching_preferences_updated_at
BEFORE UPDATE ON user_matching_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_user_seen_profiles_seen_at
BEFORE UPDATE ON user_seen_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_checkout_sessions_updated_at
BEFORE UPDATE ON checkout_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ====================
-- TRIGGER FOR USER AGE CALCULATION
-- ====================
CREATE TRIGGER trg_set_user_age
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
WHEN (NEW.birth_date IS NOT NULL)
EXECUTE FUNCTION set_user_age();