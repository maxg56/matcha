-- ====================
-- USER MANAGEMENT TABLES
-- ====================

-- ====================
-- TABLE : users
-- ====================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    password_hash TEXT NOT NULL,
    birth_date DATE ,
    age INT,
    height INT,
    premium TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    alcohol_consumption yes_sometimes_no_enum,
    smoking yes_sometimes_no_enum,
    cannabis yes_sometimes_no_enum,
    drugs yes_sometimes_no_enum,
    pets yes_no_enum,

    social_activity_level activity_level_enum,
    sport_activity activity_level_enum,
    education_level education_level_enum,

    personal_opinion TEXT,
    bio VARCHAR(400),

    birth_city VARCHAR(100),
    current_city VARCHAR(100),
    job VARCHAR(100),
    religion religion_enum,
    relationship_type relationship_type_enum ,
    children_status children_status_enum,
    children_details TEXT,

    zodiac_sign VARCHAR(50),

    hair_color hair_color_enum,
    skin_color skin_color_enum,
    eye_color eye_color_enum,

    fame INT DEFAULT 0,
    gender gender_enum NOT NULL,
    sex_pref sex_pref_enum DEFAULT 'both' NOT NULL,

    political_view political_view_enum,

    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- TABLE : email_verifications
-- ====================
CREATE TABLE email_verifications (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_verifications_email ON email_verifications(email);

-- ====================
-- TABLE : password_resets
-- ====================
CREATE TABLE password_resets (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_expires_at ON password_resets(expires_at);

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
    file_path VARCHAR(500) NOT NULL,      -- full file path on disk
    is_active BOOLEAN DEFAULT TRUE,       -- soft delete flag
    description TEXT,                     -- optional description
    alt_text VARCHAR(255),                -- accessibility alt text
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- TABLE : profile_views
-- ====================
CREATE TABLE profile_views (
    id SERIAL PRIMARY KEY,
    viewer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- TABLE : notifications
-- ====================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    to_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notif_type VARCHAR(10) NOT NULL,
    msg TEXT NOT NULL,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);