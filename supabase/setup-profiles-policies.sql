-- SQL script to set up proper Row-Level Security (RLS) policies for the profiles table

-- First, make sure RLS is enabled for the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own profile
CREATE POLICY insert_own_profile
ON profiles
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create policy to allow users to select their own profile
CREATE POLICY select_own_profile
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY update_own_profile
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create policy to allow users to delete their own profile (if needed)
CREATE POLICY delete_own_profile
ON profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);
