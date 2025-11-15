-- =====================================================
-- Migration: Create Deadlines Table
-- Description: Critical dates and reminders for projects
-- =====================================================

-- Create enum types
CREATE TYPE deadline_type AS ENUM (
    'preliminary_notice', 
    'affidavit_deadline', 
    'lien_filing', 
    'bond_claim', 
    'lawsuit_filing', 
    'custom'
);

CREATE TYPE deadline_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE deadline_status AS ENUM ('pending', 'completed', 'missed', 'cancelled');

-- Create deadlines table
CREATE TABLE deadlines (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    deadline_type deadline_type NOT NULL,
    due_date date NOT NULL,
    reminder_dates jsonb DEFAULT '[]'::jsonb,
    priority deadline_priority DEFAULT 'medium',
    status deadline_status DEFAULT 'pending',
    completed_at timestamptz,
    related_form_response_id uuid REFERENCES form_responses(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_deadlines_user_id ON deadlines(user_id);
CREATE INDEX idx_deadlines_project_id ON deadlines(project_id);
CREATE INDEX idx_deadlines_due_date ON deadlines(due_date);
CREATE INDEX idx_deadlines_status ON deadlines(status);
CREATE INDEX idx_deadlines_user_due_date ON deadlines(user_id, due_date);
CREATE INDEX idx_deadlines_priority ON deadlines(priority);
CREATE INDEX idx_deadlines_type ON deadlines(deadline_type);

-- Add updated_at trigger
CREATE TRIGGER update_deadlines_updated_at
    BEFORE UPDATE ON deadlines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own deadlines
CREATE POLICY "Users can view own deadlines"
    ON deadlines FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create deadlines for their own projects
CREATE POLICY "Users can create own deadlines"
    ON deadlines FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = deadlines.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Users can update their own deadlines
CREATE POLICY "Users can update own deadlines"
    ON deadlines FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own deadlines
CREATE POLICY "Users can delete own deadlines"
    ON deadlines FOR DELETE
    USING (auth.uid() = user_id);

-- Attorneys can view deadlines for their assigned projects
CREATE POLICY "Attorneys can view assigned project deadlines"
    ON deadlines FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = deadlines.project_id 
            AND projects.assigned_attorney_id = auth.uid()
            AND EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role IN ('attorney', 'admin')
            )
        )
    );

-- Attorneys can create deadlines for their assigned projects
CREATE POLICY "Attorneys can create assigned project deadlines"
    ON deadlines FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = deadlines.project_id 
            AND projects.assigned_attorney_id = auth.uid()
            AND EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role IN ('attorney', 'admin')
            )
        )
    );

-- Attorneys can update deadlines for their assigned projects
CREATE POLICY "Attorneys can update assigned project deadlines"
    ON deadlines FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = deadlines.project_id 
            AND projects.assigned_attorney_id = auth.uid()
            AND EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role IN ('attorney', 'admin')
            )
        )
    );

-- Admins can view all deadlines
CREATE POLICY "Admins can view all deadlines"
    ON deadlines FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can manage all deadlines
CREATE POLICY "Admins can manage all deadlines"
    ON deadlines FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Function to get upcoming deadlines
CREATE OR REPLACE FUNCTION get_upcoming_deadlines(days_ahead integer DEFAULT 30)
RETURNS TABLE (
    id uuid,
    title text,
    due_date date,
    priority deadline_priority,
    project_name text,
    days_until_due integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.title,
        d.due_date,
        d.priority,
        p.name as project_name,
        (d.due_date - CURRENT_DATE)::integer as days_until_due
    FROM deadlines d
    JOIN projects p ON d.project_id = p.id
    WHERE d.user_id = auth.uid()
    AND d.status = 'pending'
    AND d.due_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + days_ahead)
    ORDER BY d.due_date ASC, d.priority DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON deadlines TO authenticated;
