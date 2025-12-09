-- Setup Supabase Storage for Profile Pictures
-- This creates a storage bucket and sets up policies for profile image uploads

-- Note: Storage buckets are typically created via Supabase Dashboard
-- But we can set up the policies here

-- Storage bucket should be created in Supabase Dashboard:
-- Name: profile-pictures
-- Public: true (so images can be viewed publicly)
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- RLS Policies for profile-pictures bucket
-- These policies control who can upload, update, and delete profile pictures

-- Policy 1: Users can upload their own profile pictures
-- Path format: {user_id}/profile.{ext}
CREATE POLICY "Users can upload their own profile picture"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can update their own profile pictures
CREATE POLICY "Users can update their own profile picture"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can delete their own profile pictures
CREATE POLICY "Users can delete their own profile picture"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Anyone can view profile pictures (public bucket)
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Storage policies created successfully!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create bucket "profile-pictures" in Supabase Dashboard';
  RAISE NOTICE '2. Set bucket to public';
  RAISE NOTICE '3. Set file size limit to 5MB';
  RAISE NOTICE '4. Allow image MIME types only';
END $$;
