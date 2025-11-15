-- =====================================================
-- Migration: Create Assessments Tables
-- Description: Assessment questionnaires and answers
-- =====================================================

-- Create enum types
CREATE TYPE assessment_status AS ENUM ('draft', 'in_progress', 'completed', 'archived');

-- Create assessments table
CREATE TABLE assessments (
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
CREATE TABLE assessment_answers (
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

-- Create indexes for assessments
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_project_id ON assessments(project_id);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_assessments_created_at ON assessments(created_at DESC);

-- Create indexes for assessment_answers
CREATE INDEX idx_assessment_answers_assessment_id ON assessment_answers(assessment_id);
CREATE INDEX idx_assessment_answers_question_id ON assessment_answers(question_id);
CREATE INDEX idx_assessment_answers_composite ON assessment_answers(assessment_id, question_id);

-- Add updated_at triggers
CREATE TRIGGER update_assessments_updated_at
    BEFORE UPDATE ON assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_answers_updated_at
    BEFORE UPDATE ON assessment_answers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assessments
-- Users can view their own assessments
CREATE POLICY "Users can view own assessments"
    ON assessments FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own assessments
CREATE POLICY "Users can create own assessments"
    ON assessments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own assessments
CREATE POLICY "Users can update own assessments"
    ON assessments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own assessments
CREATE POLICY "Users can delete own assessments"
    ON assessments FOR DELETE
    USING (auth.uid() = user_id);

-- Admins and attorneys can view all assessments
CREATE POLICY "Admins and attorneys can view all assessments"
    ON assessments FOR SELECT
    USING (is_admin_or_attorney(auth.uid()));

-- RLS Policies for assessment_answers
-- Users can view answers from their own assessments
CREATE POLICY "Users can view own assessment answers"
    ON assessment_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM assessments 
            WHERE assessments.id = assessment_answers.assessment_id 
            AND assessments.user_id = auth.uid()
        )
    );

-- Users can create answers for their own assessments
CREATE POLICY "Users can create own assessment answers"
    ON assessment_answers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessments 
            WHERE assessments.id = assessment_answers.assessment_id 
            AND assessments.user_id = auth.uid()
        )
    );

-- Users can update answers in their own assessments
CREATE POLICY "Users can update own assessment answers"
    ON assessment_answers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM assessments 
            WHERE assessments.id = assessment_answers.assessment_id 
            AND assessments.user_id = auth.uid()
        )
    );

-- Users can delete answers from their own assessments
CREATE POLICY "Users can delete own assessment answers"
    ON assessment_answers FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM assessments 
            WHERE assessments.id = assessment_answers.assessment_id 
            AND assessments.user_id = auth.uid()
        )
    );

-- Admins and attorneys can view all assessment answers
CREATE POLICY "Admins and attorneys can view all assessment answers"
    ON assessment_answers FOR SELECT
    USING (is_admin_or_attorney(auth.uid()));

-- Grant permissions
GRANT ALL ON assessments TO authenticated;
GRANT ALL ON assessment_answers TO authenticated;
