-- =====================================================
-- Migration: Create Attorney Notes and Case Status Tables
-- Description: Internal attorney management and case tracking
-- =====================================================

-- Create enum types
CREATE TYPE note_type AS ENUM (
    'general', 
    'legal_review', 
    'strategy', 
    'client_communication', 
    'court_update'
);

CREATE TYPE note_priority AS ENUM ('low', 'normal', 'high', 'urgent');

-- Create attorney_notes table
CREATE TABLE attorney_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    attorney_id uuid NOT NULL REFERENCES profiles(id),
    note_type note_type DEFAULT 'general',
    content text NOT NULL,
    is_internal boolean DEFAULT true,
    priority note_priority DEFAULT 'normal',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create case_status_updates table
CREATE TABLE case_status_updates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    updated_by uuid NOT NULL REFERENCES profiles(id),
    old_status project_status,
    new_status project_status NOT NULL,
    comment text,
    notify_user boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for attorney_notes
CREATE INDEX idx_attorney_notes_project_id ON attorney_notes(project_id);
CREATE INDEX idx_attorney_notes_attorney_id ON attorney_notes(attorney_id);
CREATE INDEX idx_attorney_notes_created_at ON attorney_notes(created_at DESC);
CREATE INDEX idx_attorney_notes_priority ON attorney_notes(priority);
CREATE INDEX idx_attorney_notes_is_internal ON attorney_notes(is_internal);

-- Create indexes for case_status_updates
CREATE INDEX idx_case_status_updates_project_id ON case_status_updates(project_id);
CREATE INDEX idx_case_status_updates_created_at ON case_status_updates(created_at DESC);
CREATE INDEX idx_case_status_updates_updated_by ON case_status_updates(updated_by);

-- Add updated_at trigger for attorney_notes
CREATE TRIGGER update_attorney_notes_updated_at
    BEFORE UPDATE ON attorney_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE attorney_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_status_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attorney_notes
-- Attorneys can view notes they created
CREATE POLICY "Attorneys can view own notes"
    ON attorney_notes FOR SELECT
    USING (auth.uid() = attorney_id);

-- Attorneys can view notes for their assigned projects
CREATE POLICY "Attorneys can view assigned project notes"
    ON attorney_notes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = attorney_notes.project_id 
            AND projects.assigned_attorney_id = auth.uid()
        )
    );

-- Attorneys can create notes for their assigned projects
CREATE POLICY "Attorneys can create notes for assigned projects"
    ON attorney_notes FOR INSERT
    WITH CHECK (
        auth.uid() = attorney_id
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('attorney', 'admin')
        )
        AND EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = attorney_notes.project_id 
            AND projects.assigned_attorney_id = auth.uid()
        )
    );

-- Attorneys can update their own notes
CREATE POLICY "Attorneys can update own notes"
    ON attorney_notes FOR UPDATE
    USING (auth.uid() = attorney_id)
    WITH CHECK (auth.uid() = attorney_id);

-- Attorneys can delete their own notes
CREATE POLICY "Attorneys can delete own notes"
    ON attorney_notes FOR DELETE
    USING (auth.uid() = attorney_id);

-- Admins can view all attorney notes
CREATE POLICY "Admins can view all notes"
    ON attorney_notes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can create notes on any project
CREATE POLICY "Admins can create any notes"
    ON attorney_notes FOR INSERT
    WITH CHECK (
        auth.uid() = attorney_id
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can update any notes
CREATE POLICY "Admins can update all notes"
    ON attorney_notes FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Users can view non-internal notes on their own projects
CREATE POLICY "Users can view non-internal notes on own projects"
    ON attorney_notes FOR SELECT
    USING (
        is_internal = false
        AND EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = attorney_notes.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- RLS Policies for case_status_updates
-- Users can view status updates for their own projects
CREATE POLICY "Users can view own project status updates"
    ON case_status_updates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = case_status_updates.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Attorneys can view status updates for assigned projects
CREATE POLICY "Attorneys can view assigned project status updates"
    ON case_status_updates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = case_status_updates.project_id 
            AND projects.assigned_attorney_id = auth.uid()
        )
    );

-- Attorneys can create status updates for assigned projects
CREATE POLICY "Attorneys can create status updates for assigned projects"
    ON case_status_updates FOR INSERT
    WITH CHECK (
        auth.uid() = updated_by
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('attorney', 'admin')
        )
        AND EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = case_status_updates.project_id 
            AND projects.assigned_attorney_id = auth.uid()
        )
    );

-- Admins can view all status updates
CREATE POLICY "Admins can view all status updates"
    ON case_status_updates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can create status updates for any project
CREATE POLICY "Admins can create any status updates"
    ON case_status_updates FOR INSERT
    WITH CHECK (
        auth.uid() = updated_by
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Trigger to log project status changes
CREATE OR REPLACE FUNCTION log_project_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO case_status_updates (
            project_id,
            updated_by,
            old_status,
            new_status,
            comment
        ) VALUES (
            NEW.id,
            auth.uid(),
            OLD.status,
            NEW.status,
            'Status automatically updated'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to projects table
CREATE TRIGGER on_project_status_change
    AFTER UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION log_project_status_change();

-- Grant permissions
GRANT ALL ON attorney_notes TO authenticated;
GRANT ALL ON case_status_updates TO authenticated;
