-- =====================================================
-- Migration: Create Forms and Form Responses Tables
-- Description: Form templates and user-filled forms
-- =====================================================

-- Create enum types
CREATE TYPE form_category AS ENUM (
    'preliminary_notice', 
    'affidavit', 
    'lien', 
    'release', 
    'demand'
);

CREATE TYPE form_response_status AS ENUM ('draft', 'completed', 'submitted', 'filed');

-- Create forms table (templates)
CREATE TABLE forms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    category form_category,
    jurisdiction text DEFAULT 'texas',
    version text DEFAULT '1.0',
    field_definitions jsonb NOT NULL,
    template_content text,
    instructions text,
    is_active boolean DEFAULT true,
    required_for_kit_ids jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create form_responses table (user-filled)
CREATE TABLE form_responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    form_id uuid NOT NULL REFERENCES forms(id),
    form_name text NOT NULL,
    status form_response_status DEFAULT 'draft',
    field_values jsonb NOT NULL DEFAULT '{}'::jsonb,
    generated_document_url text,
    submitted_at timestamptz,
    filed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for forms
CREATE INDEX idx_forms_slug ON forms(slug);
CREATE INDEX idx_forms_category ON forms(category);
CREATE INDEX idx_forms_is_active ON forms(is_active);

-- Create indexes for form_responses
CREATE INDEX idx_form_responses_user_id ON form_responses(user_id);
CREATE INDEX idx_form_responses_project_id ON form_responses(project_id);
CREATE INDEX idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX idx_form_responses_status ON form_responses(status);
CREATE INDEX idx_form_responses_created_at ON form_responses(created_at DESC);

-- Add updated_at triggers
CREATE TRIGGER update_forms_updated_at
    BEFORE UPDATE ON forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_responses_updated_at
    BEFORE UPDATE ON form_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forms (templates)
-- Everyone can view active forms
CREATE POLICY "Anyone can view active forms"
    ON forms FOR SELECT
    USING (is_active = true);

-- Authenticated users can view all forms
CREATE POLICY "Authenticated users can view all forms"
    ON forms FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Only admins can insert forms
CREATE POLICY "Admins can insert forms"
    ON forms FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Only admins can update forms
CREATE POLICY "Admins can update forms"
    ON forms FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Only admins can delete forms
CREATE POLICY "Admins can delete forms"
    ON forms FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- RLS Policies for form_responses
-- Users can view their own form responses
CREATE POLICY "Users can view own form responses"
    ON form_responses FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create form responses for their own projects
CREATE POLICY "Users can create own form responses"
    ON form_responses FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = form_responses.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Users can update their own form responses
CREATE POLICY "Users can update own form responses"
    ON form_responses FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own form responses
CREATE POLICY "Users can delete own form responses"
    ON form_responses FOR DELETE
    USING (auth.uid() = user_id);

-- Attorneys can view form responses for their assigned projects
CREATE POLICY "Attorneys can view assigned project forms"
    ON form_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = form_responses.project_id 
            AND projects.assigned_attorney_id = auth.uid()
            AND EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role IN ('attorney', 'admin')
            )
        )
    );

-- Attorneys can update form responses for their assigned projects
CREATE POLICY "Attorneys can update assigned project forms"
    ON form_responses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = form_responses.project_id 
            AND projects.assigned_attorney_id = auth.uid()
            AND EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role IN ('attorney', 'admin')
            )
        )
    );

-- Admins can view all form responses
CREATE POLICY "Admins can view all form responses"
    ON form_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can update all form responses
CREATE POLICY "Admins can update all form responses"
    ON form_responses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Grant permissions
GRANT ALL ON forms TO authenticated;
GRANT SELECT ON forms TO anon;
GRANT ALL ON form_responses TO authenticated;
