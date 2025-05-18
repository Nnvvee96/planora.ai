-- This migration adds the missing has_completed_onboarding column to the profiles table
-- This is the root cause of the Google Sign-In onboarding loop issue

-- First, check if the column already exists to avoid errors
DO $$
BEGIN
  -- Check if the column exists
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'has_completed_onboarding'
  ) THEN
    -- Add the missing column
    ALTER TABLE profiles ADD COLUMN has_completed_onboarding BOOLEAN DEFAULT FALSE;
    
    -- Update all existing profiles to set default value
    UPDATE profiles SET has_completed_onboarding = FALSE;
    
    -- Set all Google users to have completed onboarding
    UPDATE profiles 
    SET has_completed_onboarding = TRUE
    WHERE id IN (
      SELECT DISTINCT u.id
      FROM auth.users u
      LEFT JOIN auth.identities i ON u.id = i.user_id
      WHERE 
        u.raw_app_meta_data->>'provider' = 'google' OR
        i.provider = 'google'
    );
    
    -- Add a comment to the column for documentation
    COMMENT ON COLUMN profiles.has_completed_onboarding IS 'Flag indicating whether user has completed the onboarding process';
    
    RAISE NOTICE 'Successfully added has_completed_onboarding column to profiles table';
  ELSE
    RAISE NOTICE 'Column has_completed_onboarding already exists in profiles table';
  END IF;
END $$;

-- Add column to store a timestamp of when onboarding was completed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'onboarding_completed_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onboarding_completed_at TIMESTAMP WITH TIME ZONE;
    
    -- For existing users who have completed onboarding, set a timestamp
    UPDATE profiles 
    SET onboarding_completed_at = NOW()
    WHERE has_completed_onboarding = TRUE;
    
    RAISE NOTICE 'Successfully added onboarding_completed_at column to profiles table';
  ELSE
    RAISE NOTICE 'Column onboarding_completed_at already exists in profiles table';
  END IF;
END $$;

-- Let's also add a "full_name" column if it doesn't exist, as some scripts assume it exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
    
    -- Set full_name for existing profiles based on first_name and last_name
    UPDATE profiles 
    SET full_name = CONCAT(first_name, ' ', last_name)
    WHERE first_name IS NOT NULL OR last_name IS NOT NULL;
    
    RAISE NOTICE 'Successfully added full_name column to profiles table';
  ELSE
    RAISE NOTICE 'Column full_name already exists in profiles table';
  END IF;
END $$;

-- Verify that the columns now exist
SELECT 
  column_name, 
  data_type 
FROM 
  information_schema.columns 
WHERE 
  table_name = 'profiles' 
ORDER BY 
  ordinal_position;
