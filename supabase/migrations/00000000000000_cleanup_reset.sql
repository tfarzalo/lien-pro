-- =====================================================
-- CLEANUP SCRIPT - Run this FIRST to reset database
-- WARNING: This will delete ALL data and tables
-- =====================================================

-- Drop all triggers first
DROP TRIGGER IF EXISTS on_project_status_change ON projects;
DROP TRIGGER IF EXISTS on_order_completed ON orders;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_attorney_notes_updated_at ON attorney_notes;
DROP TRIGGER IF EXISTS update_deadlines_updated_at ON deadlines;
DROP TRIGGER IF EXISTS update_form_responses_updated_at ON form_responses;
DROP TRIGGER IF EXISTS update_forms_updated_at ON forms;
DROP TRIGGER IF EXISTS update_assessment_answers_updated_at ON assessment_answers;
DROP TRIGGER IF EXISTS update_assessments_updated_at ON assessments;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_lien_kits_updated_at ON lien_kits;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS case_status_updates CASCADE;
DROP TABLE IF EXISTS attorney_notes CASCADE;
DROP TABLE IF EXISTS uploads CASCADE;
DROP TABLE IF EXISTS deadlines CASCADE;
DROP TABLE IF EXISTS form_responses CASCADE;
DROP TABLE IF EXISTS forms CASCADE;
DROP TABLE IF EXISTS assessment_answers CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS user_kits CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS lien_kits CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop all custom types
DROP TYPE IF EXISTS note_priority CASCADE;
DROP TYPE IF EXISTS note_type CASCADE;
DROP TYPE IF EXISTS deadline_status CASCADE;
DROP TYPE IF EXISTS deadline_priority CASCADE;
DROP TYPE IF EXISTS deadline_type CASCADE;
DROP TYPE IF EXISTS upload_category CASCADE;
DROP TYPE IF EXISTS form_response_status CASCADE;
DROP TYPE IF EXISTS form_category CASCADE;
DROP TYPE IF EXISTS assessment_status CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS project_type CASCADE;
DROP TYPE IF EXISTS kit_access_type CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS kit_category CASCADE;
DROP TYPE IF EXISTS subscription_tier CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS log_project_status_change() CASCADE;
DROP FUNCTION IF EXISTS get_upload_url(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_upcoming_deadlines(integer) CASCADE;
DROP FUNCTION IF EXISTS grant_kits_on_order_completion() CASCADE;
DROP FUNCTION IF EXISTS generate_order_number() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS is_admin_or_attorney(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_user_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✓ All tables, types, and functions have been dropped successfully.';
    RAISE NOTICE '✓ You can now run migrations 1-11 in order.';
END $$;
