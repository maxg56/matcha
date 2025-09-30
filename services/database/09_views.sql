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