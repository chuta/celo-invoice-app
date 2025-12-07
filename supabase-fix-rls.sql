-- Fix RLS Policy for Profile Creation
-- Run this in Supabase SQL Editor to fix the signup issue

-- Add INSERT policy for profiles table to allow users to create their own profile during signup
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
