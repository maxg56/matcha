-- ====================
-- ENUMS
-- ====================

-- Gender and sexual preferences
CREATE TYPE gender_enum AS ENUM ('man', 'woman', 'other');
CREATE TYPE sex_pref_enum AS ENUM ('man', 'woman', 'both', 'other');

-- General yes/no types
CREATE TYPE yes_no_enum AS ENUM ('yes','no');
CREATE TYPE yes_sometimes_no_enum AS ENUM ('yes','sometimes','no');

-- User profile enums
CREATE TYPE activity_level_enum AS ENUM ('low','medium','high','other');
CREATE TYPE education_level_enum AS ENUM ('high_school','bachelor','master','doctorate','other');
CREATE TYPE religion_enum AS ENUM ('christianity','islam','hinduism','buddhism','atheism','other');
CREATE TYPE relationship_type_enum AS ENUM ('friendship','short_term','long_term','life','other');
CREATE TYPE children_status_enum AS ENUM ('yes','no','other');

-- Physical appearance enums
CREATE TYPE hair_color_enum AS ENUM ('black','brown','blonde','red','gray','white','other');
CREATE TYPE skin_color_enum AS ENUM ('white','black','brown','yellow','olive','other');
CREATE TYPE eye_color_enum AS ENUM ('brown','blue','green','hazel','gray','other');

-- Politics and relationships
CREATE TYPE political_view_enum AS ENUM ('left','center','right','apolitical','other');
CREATE TYPE relation_value_enum AS ENUM ('like', 'pass', 'block');

-- Payment system enums
CREATE TYPE subscription_status_enum AS ENUM ('active', 'inactive', 'canceled', 'past_due', 'unpaid');
CREATE TYPE plan_type_enum AS ENUM ('mensuel', 'annuel');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'succeeded', 'failed', 'canceled');
CREATE TYPE checkout_session_status_enum AS ENUM ('pending', 'completed', 'expired', 'canceled');