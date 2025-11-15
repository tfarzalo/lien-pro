-- =====================================================
-- PDF Generation Supabase Edge Function
-- =====================================================
-- This SQL file documents the database structure for PDF generation
-- The actual PDF generation happens in a Supabase Edge Function

-- =====================================================
-- 1. Update the form_responses table to track PDF generation
-- =====================================================

-- Add PDF-related columns if not exists
ALTER TABLE form_responses
ADD COLUMN IF NOT EXISTS generated_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS pdf_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pdf_generation_status TEXT DEFAULT 'pending' CHECK (pdf_generation_status IN ('pending', 'processing', 'completed', 'failed'));

-- =====================================================
-- 2. Create a table for PDF templates
-- =====================================================

CREATE TABLE IF NOT EXISTS pdf_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  template_url TEXT NOT NULL, -- Supabase Storage URL
  version TEXT NOT NULL DEFAULT '1.0',
  field_mappings JSONB NOT NULL, -- Maps form field IDs to PDF field names
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. Create a table for PDF generation jobs
-- =====================================================

CREATE TABLE IF NOT EXISTS pdf_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_response_id UUID REFERENCES form_responses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  pdf_url TEXT,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. Create RLS policies
-- =====================================================

ALTER TABLE pdf_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Users can read PDF templates
CREATE POLICY "Users can read PDF templates"
ON pdf_templates FOR SELECT
TO authenticated
USING (true);

-- Users can read their own PDF generation jobs
CREATE POLICY "Users can read own PDF jobs"
ON pdf_generation_jobs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own PDF generation jobs
CREATE POLICY "Users can create own PDF jobs"
ON pdf_generation_jobs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 5. Create function to trigger PDF generation
-- =====================================================

CREATE OR REPLACE FUNCTION request_pdf_generation(
  p_form_response_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_id UUID;
  v_user_id UUID;
BEGIN
  -- Get the user_id from the form_response
  SELECT user_id INTO v_user_id
  FROM form_responses
  WHERE id = p_form_response_id;

  -- Create a new PDF generation job
  INSERT INTO pdf_generation_jobs (
    form_response_id,
    user_id,
    status
  ) VALUES (
    p_form_response_id,
    v_user_id,
    'queued'
  ) RETURNING id INTO v_job_id;

  -- Update form_response status
  UPDATE form_responses
  SET pdf_generation_status = 'processing'
  WHERE id = p_form_response_id;

  RETURN v_job_id;
END;
$$;

-- =====================================================
-- 6. Create indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_pdf_templates_form_id ON pdf_templates(form_id);
CREATE INDEX IF NOT EXISTS idx_pdf_jobs_response_id ON pdf_generation_jobs(form_response_id);
CREATE INDEX IF NOT EXISTS idx_pdf_jobs_user_id ON pdf_generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_jobs_status ON pdf_generation_jobs(status);
