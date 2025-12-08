-- Add Brisa Mukunde as Super Admin
-- User ID: e30d6281-2620-460c-993a-19ad3e3561b2
-- Email: brisamukunde1@gmail.com
-- Run this in Supabase SQL Editor

-- Update the user's profile to Super Admin role
UPDATE profiles
SET role = 'super_admin'
WHERE id = 'e30d6281-2620-460c-993a-19ad3e3561b2';

-- Verify the update
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
WHERE id = 'e30d6281-2620-460c-993a-19ad3e3561b2';

-- List all Super Admins for verification
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
WHERE role = 'super_admin'
ORDER BY created_at;
