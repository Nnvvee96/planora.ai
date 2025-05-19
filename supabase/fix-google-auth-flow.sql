-- Comprehensive fix for Google Authentication Flow
-- This script addresses the root causes of the Google Sign-In issues
-- Follow Planora's architectural principles with clean, well-documented SQL

------------------------------------------------
-- PART 1: ENSURE REQUIRED COLUMNS EXIST
------------------------------------------------

-- First, make sure the required columns exist in the profiles table
DO $$
BEGIN
  -- Check if has_completed_onboarding column exists
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'has_completed_onboarding'
  ) THEN
    -- Add the missing column with default value
    ALTER TABLE public.profiles ADD COLUMN has_completed_onboarding BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added has_completed_onboarding column to profiles table';
  ELSE
    RAISE NOTICE 'has_completed_onboarding column already exists';
  END IF;
  
  -- Check if the full_name column exists (needed for Google profile data)
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    RAISE NOTICE 'Added full_name column to profiles table';
  ELSE
    RAISE NOTICE 'full_name column already exists';
  END IF;
  
  -- Check if we have the updated_at column
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Added updated_at column to profiles table';
  ELSE
    RAISE NOTICE 'updated_at column already exists';
  END IF;
END $$;

------------------------------------------------
-- PART 2: CREATE HELPER FUNCTIONS
------------------------------------------------

-- Function to ensure a profile exists for a user
CREATE OR REPLACE FUNCTION ensure_profile_exists(user_id UUID) 
RETURNS BOOLEAN AS $$
DECLARE
  profile_exists BOOLEAN;
  user_email TEXT;
  user_first_name TEXT;
  user_last_name TEXT;
  user_full_name TEXT;
BEGIN
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id) INTO profile_exists;
  
  -- If profile already exists, we're done
  IF profile_exists THEN
    RETURN TRUE;
  END IF;
  
  -- Get user data from auth 
  SELECT 
    email,
    raw_user_meta_data->>'first_name',
    raw_user_meta_data->>'last_name',
    raw_user_meta_data->>'full_name'
  INTO 
    user_email,
    user_first_name,
    user_last_name,
    user_full_name
  FROM auth.users
  WHERE id = user_id;
  
  -- If no user found, return false
  IF user_email IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Create profile with available data
  INSERT INTO public.profiles (
    id,
    email,
    username,
    first_name,
    last_name,
    full_name,
    created_at,
    updated_at,
    has_completed_onboarding
  ) VALUES (
    user_id,
    user_email,
    split_part(user_email, '@', 1),
    COALESCE(user_first_name, ''),
    COALESCE(user_last_name, ''),
    COALESCE(user_full_name, ''),
    NOW(),
    NOW(),
    FALSE
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating profile: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to implement a trigger for automatically creating a profile when a user is created
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure profile exists
  PERFORM ensure_profile_exists(NEW.id);
  
  -- For Google users, set onboarding flags
  IF NEW.raw_app_meta_data->>'provider' = 'google' OR 
     EXISTS (SELECT 1 FROM auth.identities WHERE user_id = NEW.id AND provider = 'google')
  THEN
    -- Set user metadata for Google users
    NEW.raw_user_meta_data = 
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object('provider_type', 'google');
      
    -- Update their profile
    UPDATE public.profiles 
    SET 
      updated_at = NOW() 
    WHERE 
      id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

------------------------------------------------
-- PART 3: SET UP TRIGGERS
------------------------------------------------

-- Remove existing user creation trigger if it exists to avoid duplication
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- Create trigger for Google users (when a user is updated)
CREATE OR REPLACE FUNCTION handle_google_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is a Google auth user
  IF NEW.raw_app_meta_data->>'provider' = 'google' OR
     EXISTS (SELECT 1 FROM auth.identities WHERE user_id = NEW.id AND provider = 'google')
  THEN
    -- Ensure profile exists
    PERFORM ensure_profile_exists(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove existing Google auth trigger if it exists
DROP TRIGGER IF EXISTS on_google_auth ON auth.users;

-- Create trigger for Google users
CREATE TRIGGER on_google_auth
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_google_auth();

------------------------------------------------
-- PART 4: FIX EXISTING USERS
------------------------------------------------

-- Fix any existing users that don't have profiles
DO $$
DECLARE
  auth_user RECORD;
BEGIN
  FOR auth_user IN 
    SELECT id FROM auth.users 
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.users.id)
  LOOP
    PERFORM ensure_profile_exists(auth_user.id);
  END LOOP;
END $$;

-- Show table structure for verification
SELECT
  column_name,
  data_type,
  is_nullable
FROM
  information_schema.columns
WHERE
  table_name = 'profiles'
ORDER BY
  ordinal_position;
