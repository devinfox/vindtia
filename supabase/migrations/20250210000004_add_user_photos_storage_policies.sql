-- Storage policies for user-photos bucket
-- These policies allow users to manage their own photos (stored in folders named by user ID)

-- Policy: Allow users to upload photos to their own folder
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to update their own photos
CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to delete their own photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow public read access (since bucket is public)
CREATE POLICY "Public can view user photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-photos');
