-- =====================================================
-- Migration: Create Projects Table
-- Description: Central entity for construction projects/cases
-- =====================================================

-- Create enum types
CREATE TYPE project_type AS ENUM (
    'residential_single', 
    'residential_multi', 
    'commercial', 
    'industrial', 
    'public'
);

CREATE TYPE project_status AS ENUM (
    'draft', 
    'active', 
    'lien_filed', 
    'resolved', 
    'closed'
);

-- Create projects table
CREATE TABLE projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    project_type project_type,
    property_address jsonb,
    property_owner_name text,
    property_owner_contact jsonb,
    general_contractor_name text,
    general_contractor_contact jsonb,
    contract_date date,
    contract_amount_cents integer CHECK (contract_amount_cents >= 0),
    work_start_date date,
    work_completion_date date,
    amount_owed_cents integer CHECK (amount_owed_cents >= 0),
    status project_status DEFAULT 'active',
    assigned_attorney_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    notes text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_assigned_attorney_id ON projects(assigned_attorney_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_user_status ON projects(user_id, status);

-- Add updated_at trigger
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own projects
CREATE POLICY "Users can view own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own projects
CREATE POLICY "Users can create own projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects"
    ON projects FOR DELETE
    USING (auth.uid() = user_id);

-- Attorneys can view projects assigned to them
CREATE POLICY "Attorneys can view assigned projects"
    ON projects FOR SELECT
    USING (
        auth.uid() = assigned_attorney_id
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('attorney', 'admin')
        )
    );

-- Attorneys can update projects assigned to them
CREATE POLICY "Attorneys can update assigned projects"
    ON projects FOR UPDATE
    USING (
        auth.uid() = assigned_attorney_id
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('attorney', 'admin')
        )
    );

-- Admins can view all projects
CREATE POLICY "Admins can view all projects"
    ON projects FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can update all projects
CREATE POLICY "Admins can update all projects"
    ON projects FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Grant permissions
GRANT ALL ON projects TO authenticated;
