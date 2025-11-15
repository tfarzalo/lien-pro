-- =====================================================
-- Create Storage Buckets for PDF System
-- =====================================================

-- Create pdf-templates bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdf-templates',
  'pdf-templates',
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create generated-pdfs bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generated-pdfs',
  'generated-pdfs',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Storage Policies for pdf-templates bucket
-- =====================================================

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
-- Storage Policies for generated-pdfs bucket
-- =====================================================

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
