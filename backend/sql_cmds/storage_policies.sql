-- Storage Policies for LegalDoc Filler
-- Run this in Supabase SQL Editor to allow file uploads

-- Policy for original-documents bucket
CREATE POLICY "Allow public uploads to original-documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'original-documents');

CREATE POLICY "Allow public reads from original-documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'original-documents');

-- Policy for completed-documents bucket  
CREATE POLICY "Allow public uploads to completed-documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'completed-documents');

CREATE POLICY "Allow public reads from completed-documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'completed-documents');

-- Allow updates and deletes if needed
CREATE POLICY "Allow public updates to original-documents"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'original-documents');

CREATE POLICY "Allow public updates to completed-documents"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'completed-documents');
