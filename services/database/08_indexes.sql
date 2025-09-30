-- ====================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ====================

-- ====================
-- CHAT SYSTEM INDEXES
-- ====================
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions (message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions (user_id);

-- ====================
-- USER MATCHING PREFERENCES INDEXES
-- ====================
CREATE INDEX IF NOT EXISTS idx_user_matching_preferences_user_id ON user_matching_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_matching_preferences_updated_at ON user_matching_preferences(updated_at);

-- ====================
-- USER INTERACTIONS INDEXES
-- ====================
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_target_user_id ON user_interactions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_target ON user_interactions(user_id, target_user_id);

-- ====================
-- MATCHES INDEXES
-- ====================
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_is_active ON matches(is_active);
CREATE INDEX IF NOT EXISTS idx_matches_matched_at ON matches(matched_at);

-- ====================
-- USER INDEXES FOR MATCHING
-- ====================
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_users_age_gender ON users(age, gender);
CREATE INDEX IF NOT EXISTS idx_users_gender_sex_pref ON users(gender, sex_pref);
CREATE INDEX IF NOT EXISTS idx_users_fame ON users(fame);

-- ====================
-- PROFILE VIEWS INDEXES
-- ====================
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_id ON profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_id ON profile_views(viewed_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_created_at ON profile_views(created_at);

-- ====================
-- USER SEEN PROFILES INDEXES
-- ====================
CREATE INDEX IF NOT EXISTS idx_user_seen_profiles_user_id ON user_seen_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_seen_profiles_seen_user_id ON user_seen_profiles(seen_user_id);
CREATE INDEX IF NOT EXISTS idx_user_seen_profiles_user_seen ON user_seen_profiles(user_id, seen_user_id);

-- ====================
-- PAYMENT SYSTEM INDEXES
-- ====================

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_updated_at ON subscriptions(updated_at);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Checkout sessions indexes
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_user_id ON checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_stripe_session_id ON checkout_sessions(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_stripe_customer_id ON checkout_sessions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_status ON checkout_sessions(status);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_expires_at ON checkout_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_created_at ON checkout_sessions(created_at);

-- Webhook events indexes
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);