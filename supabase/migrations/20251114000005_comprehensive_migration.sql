-- =====================================================
-- COMPREHENSIVE MIGRATION: Projects and Beyond
-- Description: Safe migration handling existing projects table
--              and all subsequent tables/features
-- Run this ONCE after migrations 1-4 are complete
-- =====================================================

-- =====================================================
-- PART 1: Projects Table (Safe with existing table)
-- =====================================================

-- Create enum types (safe with IF NOT EXISTS)
DO $$ BEGIN
    CREATE TYPE project_type AS ENUM (
        'residential_single', 
        'residential_multi', 
        'commercial', 
        'industrial', 
        'public'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM (
        'draft', 
        'active', 
        'lien_filed', 
        'resolved', 
        'closed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop and recreate projects table to ensure correct schema
DROP TABLE IF EXISTS projects CASCADE;

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
CREATE POLICY "Users can view own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
    ON projects FOR DELETE
    USING (auth.uid() = user_id);

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

CREATE POLICY "Admins can view all projects"
    ON projects FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

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

-- =====================================================
-- PART 2: Assessments Tables
-- =====================================================

-- Create enum types
DO $$ BEGIN
    CREATE TYPE assessment_status AS ENUM ('draft', 'in_progress', 'completed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
    assessment_type text DEFAULT 'lien_eligibility',
    status assessment_status DEFAULT 'in_progress',
    current_step integer DEFAULT 1,
    total_steps integer DEFAULT 5,
    result_summary jsonb,
    recommended_kit_ids jsonb DEFAULT '[]'::jsonb,
    completed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create assessment_answers table
CREATE TABLE IF NOT EXISTS assessment_answers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_id text NOT NULL,
    question_text text NOT NULL,
    answer_type text NOT NULL CHECK (answer_type IN ('text', 'radio', 'checkbox', 'date', 'number')),
    answer_value jsonb NOT NULL,
    step_number integer,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(assessment_id, question_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_project_id ON assessments(project_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_assessment_id ON assessment_answers(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_question_id ON assessment_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_composite ON assessment_answers(assessment_id, question_id);

-- Add triggers
DROP TRIGGER IF EXISTS update_assessments_updated_at ON assessments;
CREATE TRIGGER update_assessments_updated_at
    BEFORE UPDATE ON assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assessment_answers_updated_at ON assessment_answers;
CREATE TRIGGER update_assessment_answers_updated_at
    BEFORE UPDATE ON assessment_answers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can create own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can update own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can delete own assessments" ON assessments;
DROP POLICY IF EXISTS "Admins and attorneys can view all assessments" ON assessments;
DROP POLICY IF EXISTS "Users can view own assessment answers" ON assessment_answers;
DROP POLICY IF EXISTS "Users can create own assessment answers" ON assessment_answers;
DROP POLICY IF EXISTS "Users can update own assessment answers" ON assessment_answers;
DROP POLICY IF EXISTS "Users can delete own assessment answers" ON assessment_answers;
DROP POLICY IF EXISTS "Admins and attorneys can view all assessment answers" ON assessment_answers;

-- Create RLS Policies
CREATE POLICY "Users can view own assessments"
    ON assessments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assessments"
    ON assessments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments"
    ON assessments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assessments"
    ON assessments FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins and attorneys can view all assessments"
    ON assessments FOR SELECT
    USING (is_admin_or_attorney(auth.uid()));

CREATE POLICY "Users can view own assessment answers"
    ON assessment_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM assessments 
            WHERE assessments.id = assessment_answers.assessment_id 
            AND assessments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own assessment answers"
    ON assessment_answers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessments 
            WHERE assessments.id = assessment_answers.assessment_id 
            AND assessments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own assessment answers"
    ON assessment_answers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM assessments 
            WHERE assessments.id = assessment_answers.assessment_id 
            AND assessments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own assessment answers"
    ON assessment_answers FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM assessments 
            WHERE assessments.id = assessment_answers.assessment_id 
            AND assessments.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins and attorneys can view all assessment answers"
    ON assessment_answers FOR SELECT
    USING (is_admin_or_attorney(auth.uid()));

-- Grant permissions
GRANT ALL ON assessments TO authenticated;
GRANT ALL ON assessment_answers TO authenticated;

-- =====================================================
-- PART 3: Forms and Form Responses Tables
-- =====================================================

-- Create enum types
DO $$ BEGIN
    CREATE TYPE form_category AS ENUM (
        'preliminary_notice', 
        'affidavit', 
        'lien', 
        'release', 
        'demand'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE form_response_status AS ENUM ('draft', 'completed', 'submitted', 'filed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create forms table
CREATE TABLE IF NOT EXISTS forms (
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

-- Create form_responses table
CREATE TABLE IF NOT EXISTS form_responses (
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_forms_slug ON forms(slug);
CREATE INDEX IF NOT EXISTS idx_forms_category ON forms(category);
CREATE INDEX IF NOT EXISTS idx_forms_is_active ON forms(is_active);
CREATE INDEX IF NOT EXISTS idx_form_responses_user_id ON form_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_project_id ON form_responses(project_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_status ON form_responses(status);
CREATE INDEX IF NOT EXISTS idx_form_responses_created_at ON form_responses(created_at DESC);

-- Add triggers
DROP TRIGGER IF EXISTS update_forms_updated_at ON forms;
CREATE TRIGGER update_forms_updated_at
    BEFORE UPDATE ON forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_form_responses_updated_at ON form_responses;
CREATE TRIGGER update_form_responses_updated_at
    BEFORE UPDATE ON form_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active forms" ON forms;
DROP POLICY IF EXISTS "Authenticated users can view all forms" ON forms;
DROP POLICY IF EXISTS "Admins can insert forms" ON forms;
DROP POLICY IF EXISTS "Admins can update forms" ON forms;
DROP POLICY IF EXISTS "Admins can delete forms" ON forms;
DROP POLICY IF EXISTS "Users can view own form responses" ON form_responses;
DROP POLICY IF EXISTS "Users can create own form responses" ON form_responses;
DROP POLICY IF EXISTS "Users can update own form responses" ON form_responses;
DROP POLICY IF EXISTS "Users can delete own form responses" ON form_responses;
DROP POLICY IF EXISTS "Attorneys can view assigned project forms" ON form_responses;
DROP POLICY IF EXISTS "Attorneys can update assigned project forms" ON form_responses;
DROP POLICY IF EXISTS "Admins can view all form responses" ON form_responses;
DROP POLICY IF EXISTS "Admins can update all form responses" ON form_responses;

-- Create RLS Policies for forms
CREATE POLICY "Anyone can view active forms"
    ON forms FOR SELECT
    USING (is_active = true);

CREATE POLICY "Authenticated users can view all forms"
    ON forms FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert forms"
    ON forms FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update forms"
    ON forms FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete forms"
    ON forms FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Create RLS Policies for form_responses
CREATE POLICY "Users can view own form responses"
    ON form_responses FOR SELECT
    USING (auth.uid() = user_id);

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

CREATE POLICY "Users can update own form responses"
    ON form_responses FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own form responses"
    ON form_responses FOR DELETE
    USING (auth.uid() = user_id);

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

CREATE POLICY "Admins can view all form responses"
    ON form_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

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

-- =====================================================
-- PART 4: Deadlines Table
-- =====================================================

-- Create enum types
DO $$ BEGIN
    CREATE TYPE deadline_type AS ENUM (
        'preliminary_notice', 
        'affidavit_deadline', 
        'lien_filing', 
        'bond_claim', 
        'lawsuit_filing', 
        'custom'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE deadline_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE deadline_status AS ENUM ('pending', 'completed', 'missed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create deadlines table
CREATE TABLE IF NOT EXISTS deadlines (
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
CREATE INDEX IF NOT EXISTS idx_deadlines_user_id ON deadlines(user_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_project_id ON deadlines(project_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_due_date ON deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_status ON deadlines(status);
CREATE INDEX IF NOT EXISTS idx_deadlines_user_due_date ON deadlines(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_priority ON deadlines(priority);
CREATE INDEX IF NOT EXISTS idx_deadlines_type ON deadlines(deadline_type);

-- Add trigger
DROP TRIGGER IF EXISTS update_deadlines_updated_at ON deadlines;
CREATE TRIGGER update_deadlines_updated_at
    BEFORE UPDATE ON deadlines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own deadlines" ON deadlines;
DROP POLICY IF EXISTS "Users can create own deadlines" ON deadlines;
DROP POLICY IF EXISTS "Users can update own deadlines" ON deadlines;
DROP POLICY IF EXISTS "Users can delete own deadlines" ON deadlines;
DROP POLICY IF EXISTS "Attorneys can view assigned project deadlines" ON deadlines;
DROP POLICY IF EXISTS "Attorneys can create assigned project deadlines" ON deadlines;
DROP POLICY IF EXISTS "Attorneys can update assigned project deadlines" ON deadlines;
DROP POLICY IF EXISTS "Admins can view all deadlines" ON deadlines;
DROP POLICY IF EXISTS "Admins can manage all deadlines" ON deadlines;

-- Create RLS Policies
CREATE POLICY "Users can view own deadlines"
    ON deadlines FOR SELECT
    USING (auth.uid() = user_id);

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

CREATE POLICY "Users can update own deadlines"
    ON deadlines FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own deadlines"
    ON deadlines FOR DELETE
    USING (auth.uid() = user_id);

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

CREATE POLICY "Admins can view all deadlines"
    ON deadlines FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all deadlines"
    ON deadlines FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Create helper function
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

-- =====================================================
-- PART 5: Uploads Table
-- =====================================================

-- Create enum type
DO $$ BEGIN
    CREATE TYPE upload_category AS ENUM (
        'contract', 
        'invoice', 
        'photo', 
        'correspondence', 
        'court_filing', 
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create uploads table
CREATE TABLE IF NOT EXISTS uploads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    form_response_id uuid REFERENCES form_responses(id) ON DELETE SET NULL,
    file_name text NOT NULL,
    file_size_bytes bigint NOT NULL CHECK (file_size_bytes > 0),
    file_type text NOT NULL,
    storage_path text NOT NULL,
    storage_bucket text DEFAULT 'documents',
    category upload_category,
    description text,
    is_public boolean DEFAULT false,
    uploaded_by uuid NOT NULL REFERENCES profiles(id),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_project_id ON uploads(project_id);
CREATE INDEX IF NOT EXISTS idx_uploads_form_response_id ON uploads(form_response_id);
CREATE INDEX IF NOT EXISTS idx_uploads_category ON uploads(category);
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_uploads_uploaded_by ON uploads(uploaded_by);

-- Enable RLS
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own uploads" ON uploads;
DROP POLICY IF EXISTS "Users can view public uploads" ON uploads;
DROP POLICY IF EXISTS "Users can upload own files" ON uploads;
DROP POLICY IF EXISTS "Users can update own uploads" ON uploads;
DROP POLICY IF EXISTS "Users can delete own uploads" ON uploads;
DROP POLICY IF EXISTS "Attorneys can view assigned project uploads" ON uploads;
DROP POLICY IF EXISTS "Attorneys can upload to assigned projects" ON uploads;
DROP POLICY IF EXISTS "Admins can view all uploads" ON uploads;
DROP POLICY IF EXISTS "Admins can upload any files" ON uploads;
DROP POLICY IF EXISTS "Admins can update all uploads" ON uploads;
DROP POLICY IF EXISTS "Admins can delete all uploads" ON uploads;

-- Create RLS Policies
CREATE POLICY "Users can view own uploads"
    ON uploads FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view public uploads"
    ON uploads FOR SELECT
    USING (is_public = true);

CREATE POLICY "Users can upload own files"
    ON uploads FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND auth.uid() = uploaded_by
        AND (
            project_id IS NULL
            OR EXISTS (
                SELECT 1 FROM projects 
                WHERE projects.id = uploads.project_id 
                AND projects.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update own uploads"
    ON uploads FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own uploads"
    ON uploads FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Attorneys can view assigned project uploads"
    ON uploads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = uploads.project_id 
            AND projects.assigned_attorney_id = auth.uid()
            AND EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role IN ('attorney', 'admin')
            )
        )
    );

CREATE POLICY "Attorneys can upload to assigned projects"
    ON uploads FOR INSERT
    WITH CHECK (
        auth.uid() = uploaded_by
        AND EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = uploads.project_id 
            AND projects.assigned_attorney_id = auth.uid()
            AND EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role IN ('attorney', 'admin')
            )
        )
    );

CREATE POLICY "Admins can view all uploads"
    ON uploads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can upload any files"
    ON uploads FOR INSERT
    WITH CHECK (
        auth.uid() = uploaded_by
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all uploads"
    ON uploads FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete all uploads"
    ON uploads FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Create helper function
CREATE OR REPLACE FUNCTION get_upload_url(upload_id uuid)
RETURNS text AS $$
DECLARE
    bucket text;
    path text;
BEGIN
    SELECT storage_bucket, storage_path 
    INTO bucket, path
    FROM uploads 
    WHERE id = upload_id;
    
    RETURN format('https://your-project.supabase.co/storage/v1/object/public/%s/%s', bucket, path);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON uploads TO authenticated;

-- =====================================================
-- PART 6: Attorney Notes and Case Status Tables
-- =====================================================

-- Create enum types
DO $$ BEGIN
    CREATE TYPE note_type AS ENUM (
        'general', 
        'legal_review', 
        'strategy', 
        'client_communication', 
        'court_update'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE note_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create attorney_notes table
CREATE TABLE IF NOT EXISTS attorney_notes (
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
CREATE TABLE IF NOT EXISTS case_status_updates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    updated_by uuid NOT NULL REFERENCES profiles(id),
    old_status project_status,
    new_status project_status NOT NULL,
    comment text,
    notify_user boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_attorney_notes_project_id ON attorney_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_attorney_notes_attorney_id ON attorney_notes(attorney_id);
CREATE INDEX IF NOT EXISTS idx_attorney_notes_created_at ON attorney_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attorney_notes_priority ON attorney_notes(priority);
CREATE INDEX IF NOT EXISTS idx_attorney_notes_is_internal ON attorney_notes(is_internal);
CREATE INDEX IF NOT EXISTS idx_case_status_updates_project_id ON case_status_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_case_status_updates_created_at ON case_status_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_status_updates_updated_by ON case_status_updates(updated_by);

-- Add trigger
DROP TRIGGER IF EXISTS update_attorney_notes_updated_at ON attorney_notes;
CREATE TRIGGER update_attorney_notes_updated_at
    BEFORE UPDATE ON attorney_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE attorney_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_status_updates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Attorneys can view own notes" ON attorney_notes;
DROP POLICY IF EXISTS "Attorneys can view assigned project notes" ON attorney_notes;
DROP POLICY IF EXISTS "Attorneys can create notes for assigned projects" ON attorney_notes;
DROP POLICY IF EXISTS "Attorneys can update own notes" ON attorney_notes;
DROP POLICY IF EXISTS "Attorneys can delete own notes" ON attorney_notes;
DROP POLICY IF EXISTS "Admins can view all notes" ON attorney_notes;
DROP POLICY IF EXISTS "Admins can create any notes" ON attorney_notes;
DROP POLICY IF EXISTS "Admins can update all notes" ON attorney_notes;
DROP POLICY IF EXISTS "Users can view non-internal notes on own projects" ON attorney_notes;
DROP POLICY IF EXISTS "Users can view own project status updates" ON case_status_updates;
DROP POLICY IF EXISTS "Attorneys can view assigned project status updates" ON case_status_updates;
DROP POLICY IF EXISTS "Attorneys can create status updates for assigned projects" ON case_status_updates;
DROP POLICY IF EXISTS "Admins can view all status updates" ON case_status_updates;
DROP POLICY IF EXISTS "Admins can create any status updates" ON case_status_updates;

-- Create RLS Policies for attorney_notes
CREATE POLICY "Attorneys can view own notes"
    ON attorney_notes FOR SELECT
    USING (auth.uid() = attorney_id);

CREATE POLICY "Attorneys can view assigned project notes"
    ON attorney_notes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = attorney_notes.project_id 
            AND projects.assigned_attorney_id = auth.uid()
        )
    );

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

CREATE POLICY "Attorneys can update own notes"
    ON attorney_notes FOR UPDATE
    USING (auth.uid() = attorney_id)
    WITH CHECK (auth.uid() = attorney_id);

CREATE POLICY "Attorneys can delete own notes"
    ON attorney_notes FOR DELETE
    USING (auth.uid() = attorney_id);

CREATE POLICY "Admins can view all notes"
    ON attorney_notes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

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

CREATE POLICY "Admins can update all notes"
    ON attorney_notes FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

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

-- Create RLS Policies for case_status_updates
CREATE POLICY "Users can view own project status updates"
    ON case_status_updates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = case_status_updates.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Attorneys can view assigned project status updates"
    ON case_status_updates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = case_status_updates.project_id 
            AND projects.assigned_attorney_id = auth.uid()
        )
    );

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

CREATE POLICY "Admins can view all status updates"
    ON case_status_updates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

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

-- Create trigger function
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
DROP TRIGGER IF EXISTS on_project_status_change ON projects;
CREATE TRIGGER on_project_status_change
    AFTER UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION log_project_status_change();

-- Grant permissions
GRANT ALL ON attorney_notes TO authenticated;
GRANT ALL ON case_status_updates TO authenticated;

-- =====================================================
-- PART 7: Seed Sample Data
-- =====================================================

-- Insert sample lien kits (only if not exists)
INSERT INTO lien_kits (name, slug, description, long_description, price_cents, category, is_active, is_popular, features, includes_attorney_review, sort_order)
SELECT * FROM (VALUES
    (
        'Texas Residential Lien Kit',
        'texas-residential-lien-kit',
        'Complete forms and guidance for residential construction projects',
        'This comprehensive kit includes all the forms and step-by-step guidance needed to file a mechanics lien on a residential construction project in Texas.',
        19900,
        'residential'::kit_category,
        true,
        true,
        '["Preliminary Notice templates", "Mechanics Lien affidavit", "Notice to Owner forms", "Step-by-step filing guide"]'::jsonb,
        false,
        1
    ),
    (
        'Commercial Lien Package',
        'commercial-lien-package',
        'Comprehensive toolkit for commercial construction liens',
        'Designed for larger commercial construction projects, this package includes advanced forms for complex projects.',
        29900,
        'commercial'::kit_category,
        true,
        true,
        '["Complex project templates", "Multiple party notices", "Bond claim forms", "Attorney review included"]'::jsonb,
        true,
        2
    ),
    (
        'Subcontractor Essentials',
        'subcontractor-essentials',
        'Essential lien forms specifically for subcontractors',
        'Streamlined package designed specifically for subcontractors.',
        14900,
        'subcontractor'::kit_category,
        true,
        true,
        '["Quick-start templates", "Deadline calculator", "Preliminary notices", "Payment demand letters"]'::jsonb,
        false,
        3
    )
) AS v(name, slug, description, long_description, price_cents, category, is_active, is_popular, features, includes_attorney_review, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM lien_kits WHERE slug = v.slug);

-- Insert sample form templates (only if not exists)
INSERT INTO forms (name, slug, description, category, jurisdiction, version, field_definitions, instructions, is_active)
SELECT * FROM (VALUES
    (
        'Texas Preliminary Notice (Original Contractor)',
        'tx-preliminary-notice-original',
        'Preliminary notice form for original contractors',
        'preliminary_notice'::form_category,
        'texas',
        '1.0',
        '{"fields": [{"id": "property_owner_name", "label": "Property Owner Name", "type": "text", "required": true}]}'::jsonb,
        'Send within 15 days of first delivery.',
        true
    ),
    (
        'Texas Affidavit Claiming Lien',
        'tx-affidavit-claiming-lien',
        'Sworn affidavit to file a mechanics lien',
        'affidavit'::form_category,
        'texas',
        '1.0',
        '{"fields": [{"id": "claimant_name", "label": "Claimant Name", "type": "text", "required": true}]}'::jsonb,
        'Must be filed with county clerk.',
        true
    )
) AS v(name, slug, description, category, jurisdiction, version, field_definitions, instructions, is_active)
WHERE NOT EXISTS (SELECT 1 FROM forms WHERE slug = v.slug);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Add comments
COMMENT ON TABLE projects IS 'User construction projects/cases';
COMMENT ON TABLE assessments IS 'Lien eligibility assessment sessions';
COMMENT ON TABLE assessment_answers IS 'Individual answers within assessments';
COMMENT ON TABLE forms IS 'Form templates used across different lien kits';
COMMENT ON TABLE form_responses IS 'User-filled form instances';
COMMENT ON TABLE deadlines IS 'Critical dates and reminders for projects';
COMMENT ON TABLE uploads IS 'Document and file uploads';
COMMENT ON TABLE attorney_notes IS 'Internal attorney notes on projects';
COMMENT ON TABLE case_status_updates IS 'Timeline of project status changes';
