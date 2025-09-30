-- ====================
-- SCHEMA SETUP
-- ====================
-- DROP SCHEMA public CASCADE;
CREATE SCHEMA IF NOT EXISTS public;
SET search_path TO public;

-- ====================
-- RESET DES TABLES
-- ====================
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS discussion CASCADE;
DROP TABLE IF EXISTS relations CASCADE;
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS user_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS email_verifications CASCADE;
DROP TABLE IF EXISTS password_resets CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS users CASCADE;