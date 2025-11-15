-- =====================================================
-- SUPABASE STORAGE SETUP - Run this in SQL Editor
-- =====================================================
-- Instructions:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Copy and paste this entire script
-- 5. Click "Run"
-- =====================================================

-- =====================================================
-- Step 1: Create Storage Buckets
-- =====================================================

-- Create pdf-templates bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdf-templates',
  'pdf-templates',
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf']::text[];

-- Create generated-pdfs bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generated-pdfs',
  'generated-pdfs',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf']::text[];

-- =====================================================
-- Step 2: Storage Policies for pdf-templates bucket
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access to PDF Templates" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload PDF Templates" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update PDF Templates" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete PDF Templates" ON storage.objects;

-- Anyone can read PDF templates (public bucket)
CREATE POLICY "Public Access to PDF Templates"
ON storage.objects FOR SELECT
USING (bucket_id = 'pdf-templates');

-- Only admins can upload templates
CREATE POLICY "Admin Upload PDF Templates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pdf-templates' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only admins can update templates
CREATE POLICY "Admin Update PDF Templates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pdf-templates' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only admins can delete templates
CREATE POLICY "Admin Delete PDF Templates"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'pdf-templates' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- Step 3: Storage Policies for generated-pdfs bucket
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users Read Own Generated PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users Upload Own Generated PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users Update Own Generated PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users Delete Own Generated PDFs" ON storage.objects;

-- Users can only read their own generated PDFs
CREATE POLICY "Users Read Own Generated PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'generated-pdfs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can only upload to their own folder
CREATE POLICY "Users Upload Own Generated PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'generated-pdfs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can only update their own PDFs
CREATE POLICY "Users Update Own Generated PDFs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'generated-pdfs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can only delete their own PDFs
CREATE POLICY "Users Delete Own Generated PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'generated-pdfs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- Verification Queries (optional - run separately)
-- =====================================================

-- Check buckets were created
-- SELECT * FROM storage.buckets;

-- Check policies were created
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- =====================================================
-- Success! Your storage buckets are now set up.
-- =====================================================
