-- ====================
-- MATCHA DATABASE INITIALIZATION
-- ====================
-- This script runs all database setup files in the correct order

\echo 'Starting Matcha database initialization...'

\echo '1. Setting up schema and cleaning tables...'
\i 01_schema_setup.sql

\echo '2. Creating enums...'
\i 02_enums.sql

\echo '3. Creating user management tables...'
\i 03_user_tables.sql

\echo '4. Creating matching system tables...'
\i 04_matching_tables.sql

\echo '5. Creating chat system tables...'
\i 05_chat_tables.sql

\echo '6. Creating payment system tables...'
\i 06_payment_tables.sql

\echo '7. Creating functions and triggers...'
\i 07_functions_triggers.sql

\echo '8. Creating indexes for performance...'
\i 08_indexes.sql

\echo '9. Creating analytical views...'
\i 09_views.sql

\echo '10. Inserting test data...'
\i 10_test_data.sql

\echo 'Matcha database initialization completed successfully!'
\echo 'Database is ready for use.'