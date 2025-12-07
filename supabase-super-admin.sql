-- Add Super Admin Role to CELOAfricaDAO Invoice System
-- Run this in Supabase SQL Editor

-- 1. Update the user_role enum to include super_admin
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';

-- 2. Set the specific user as super admin
UPDATE profiles 
SET role = 'super_admin' 
WHERE id = '98365811-902c-4d93-b301-24f07c9359dd' 
   OR email = 'blockspacetechnologies@gmail.com';

-- 3. Add RLS policy for super admin to manage user roles
CREATE POLICY "Super admins can update user roles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- 4. Add RLS policy for super admins to view all profiles
CREATE POLICY "Super admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Verify the update
SELECT id, email, full_name, role 
FROM profiles 
WHERE email = 'blockspacetechnologies@gmail.com';
