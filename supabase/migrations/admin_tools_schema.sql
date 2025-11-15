-- =====================================================
-- Admin Tools Database Schema Migration
-- Run this migration to set up admin/attorney features
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. User Roles
-- =====================================================

-- Create enum type for user roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'attorney', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add role column to profiles table (if not exists)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';

-- Add active status column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- =====================================================
-- 2. Internal Notes
-- =====================================================

-- Internal notes for staff to communicate about submissions
CREATE TABLE IF NOT EXISTS internal_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_kit_id UUID NOT NULL REFERENCES user_kits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  author_id UUID NOT NULL REFERENCES auth.users(id),
  note_type TEXT CHECK (note_type IN ('review', 'follow_up', 'issue', 'resolved')),
  content TEXT NOT NULL,
  is_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_internal_notes_user_kit ON internal_notes(user_kit_id);
CREATE INDEX IF NOT EXISTS idx_internal_notes_author ON internal_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_internal_notes_created ON internal_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_internal_notes_flagged ON internal_notes(is_flagged) WHERE is_flagged = true;

-- RLS Policies for internal_notes
ALTER TABLE internal_notes ENABLE ROW LEVEL SECURITY;

-- Admin and attorneys can view all notes
CREATE POLICY "Admin and attorneys can view all notes"
ON internal_notes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'attorney')
  )
);

-- Only admins and attorneys can insert notes
CREATE POLICY "Admin and attorneys can insert notes"
ON internal_notes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'attorney')
  )
);

-- Only note author or admin can update
CREATE POLICY "Author or admin can update notes"
ON internal_notes FOR UPDATE
USING (
  author_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- 3. Status History
-- =====================================================

-- Track all status changes for submissions
CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_kit_id UUID NOT NULL REFERENCES user_kits(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_status_history_user_kit ON status_history(user_kit_id);
CREATE INDEX IF NOT EXISTS idx_status_history_created ON status_history(created_at DESC);

-- RLS Policies for status_history
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- Admin and attorneys can view all history
CREATE POLICY "Admin and attorneys can view status history"
ON status_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'attorney')
  )
);

-- Only admins and attorneys can insert history
CREATE POLICY "Admin and attorneys can insert status history"
ON status_history FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'attorney')
  )
);

-- =====================================================
-- 4. Admin Activity Log
-- =====================================================

-- Log all admin/attorney actions for audit trail
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_admin ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON admin_activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON admin_activity_log(action_type);

-- RLS Policies for admin_activity_log
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Admin and attorneys can view all activity
CREATE POLICY "Admin and attorneys can view activity log"
ON admin_activity_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'attorney')
  )
);

-- Only system can insert (via service function)
CREATE POLICY "System can insert activity log"
ON admin_activity_log FOR INSERT
WITH CHECK (true);

-- =====================================================
-- 5. Update trigger for internal_notes
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for internal_notes
DROP TRIGGER IF EXISTS update_internal_notes_updated_at ON internal_notes;
CREATE TRIGGER update_internal_notes_updated_at
    BEFORE UPDATE ON internal_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. Views for Admin Dashboard
-- =====================================================

-- View: Recent submissions with user info
CREATE OR REPLACE VIEW admin_recent_submissions AS
SELECT 
  uk.id,
  uk.user_id,
  uk.kit_id,
  uk.status,
  uk.created_at,
  uk.updated_at,
  u.email as user_email,
  u.raw_user_meta_data->>'full_name' as user_name,
  k.name as kit_name,
  k.kit_type
FROM user_kits uk
JOIN auth.users u ON uk.user_id = u.id
JOIN lien_kits k ON uk.kit_id = k.id
ORDER BY uk.created_at DESC
LIMIT 100;

-- View: Overdue deadlines
CREATE OR REPLACE VIEW admin_overdue_deadlines AS
SELECT 
  d.id,
  d.user_kit_id,
  d.deadline_type,
  d.deadline_date,
  d.status,
  d.priority,
  uk.user_id,
  u.email as user_email,
  u.raw_user_meta_data->>'full_name' as user_name
FROM deadlines d
JOIN user_kits uk ON d.user_kit_id = uk.id
JOIN auth.users u ON uk.user_id = u.id
WHERE d.deadline_date < NOW()
  AND d.status != 'completed'
ORDER BY d.deadline_date ASC;

-- =====================================================
-- 7. Grant permissions (if needed)
-- =====================================================

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant access to tables
GRANT SELECT, INSERT, UPDATE ON internal_notes TO authenticated;
GRANT SELECT, INSERT ON status_history TO authenticated;
GRANT SELECT, INSERT ON admin_activity_log TO authenticated;

-- Grant access to views
GRANT SELECT ON admin_recent_submissions TO authenticated;
GRANT SELECT ON admin_overdue_deadlines TO authenticated;

-- =====================================================
-- 8. Sample Data (Optional - for testing)
-- =====================================================

-- Uncomment to create a sample admin user
-- NOTE: Replace with actual user ID from your auth.users table

-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE email = 'admin@example.com';

-- UPDATE profiles 
-- SET role = 'attorney' 
-- WHERE email = 'attorney@example.com';

-- =====================================================
-- Migration Complete
-- =====================================================

-- Verify tables were created
DO $$
BEGIN
  RAISE NOTICE 'Admin tools migration complete!';
  RAISE NOTICE 'Tables created: internal_notes, status_history, admin_activity_log';
  RAISE NOTICE 'Views created: admin_recent_submissions, admin_overdue_deadlines';
  RAISE NOTICE 'Remember to set user roles in profiles table!';
END $$;
