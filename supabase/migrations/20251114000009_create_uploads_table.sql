-- =====================================================
-- Migration: Create Uploads Table
-- Description: Document and file upload management
-- =====================================================

-- Create enum for upload categories
CREATE TYPE upload_category AS ENUM (
    'contract', 
    'invoice', 
    'photo', 
    'correspondence', 
    'court_filing', 
    'other'
);

-- Create uploads table
CREATE TABLE uploads (
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
CREATE INDEX idx_uploads_user_id ON uploads(user_id);
CREATE INDEX idx_uploads_project_id ON uploads(project_id);
CREATE INDEX idx_uploads_form_response_id ON uploads(form_response_id);
CREATE INDEX idx_uploads_category ON uploads(category);
CREATE INDEX idx_uploads_created_at ON uploads(created_at DESC);
CREATE INDEX idx_uploads_uploaded_by ON uploads(uploaded_by);

-- Enable RLS
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own uploads
CREATE POLICY "Users can view own uploads"
    ON uploads FOR SELECT
    USING (auth.uid() = user_id);

-- Users can view public uploads
CREATE POLICY "Users can view public uploads"
    ON uploads FOR SELECT
    USING (is_public = true);

-- Users can upload files for their own projects
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

-- Users can update their own uploads (metadata only, not file)
CREATE POLICY "Users can update own uploads"
    ON uploads FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own uploads
CREATE POLICY "Users can delete own uploads"
    ON uploads FOR DELETE
    USING (auth.uid() = user_id);

-- Attorneys can view uploads for their assigned projects
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

-- Attorneys can upload files to their assigned projects
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

-- Admins can view all uploads
CREATE POLICY "Admins can view all uploads"
    ON uploads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can upload any files
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

-- Admins can update any uploads
CREATE POLICY "Admins can update all uploads"
    ON uploads FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can delete any uploads
CREATE POLICY "Admins can delete all uploads"
    ON uploads FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Function to get file storage URL
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
    
    -- This would integrate with Supabase Storage API
    -- For now, return a placeholder
    RETURN format('https://your-project.supabase.co/storage/v1/object/public/%s/%s', bucket, path);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON uploads TO authenticated;
