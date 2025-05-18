-- SQL migration to fix Google Sign-In onboarding loop
-- This script permanently fixes profile creation and onboarding status issues

-- STEP 1: Make sure the RPC function exists to allow creating profiles when RLS fails
CREATE OR REPLACE FUNCTION create_profile_with_admin(
  user_id UUID,
  user_email TEXT,
  user_username TEXT,
  user_first_name TEXT,
  user_last_name TEXT,
  user_full_name TEXT,
  has_completed_onboarding BOOLEAN DEFAULT TRUE
) RETURNS VOID AS $$
BEGIN
  -- Use direct insert bypassing RLS
  INSERT INTO profiles (
    id, 
    email, 
    username, 
    first_name, 
    last_name, 
    full_name, 
    created_at, 
    updated_at, 
    has_completed_onboarding
  ) 
  VALUES (
    user_id, 
    user_email, 
    user_username, 
    user_first_name, 
    user_last_name, 
    user_full_name, 
    NOW(), 
    NOW(), 
    has_completed_onboarding
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    full_name = EXCLUDED.full_name,
    updated_at = NOW(),
    has_completed_onboarding = EXCLUDED.has_completed_onboarding;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 2: Create a function to sync auth metadata and profile information
CREATE OR REPLACE FUNCTION sync_google_user_profile(
  user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  auth_email TEXT;
  auth_full_name TEXT;
  auth_first_name TEXT;
  auth_last_name TEXT;
  profile_exists BOOLEAN;
BEGIN
  -- Check if user exists in auth.users
  SELECT 
    email, 
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'first_name',
    raw_user_meta_data->>'last_name'
  INTO auth_email, auth_full_name, auth_first_name, auth_last_name
  FROM auth.users
  WHERE id = user_id;
  
  IF auth_email IS NULL THEN
    -- User doesn't exist in auth
    RETURN FALSE;
  END IF;
  
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO profile_exists;
  
  IF NOT profile_exists THEN
    -- Create profile if it doesn't exist
    INSERT INTO profiles (
      id, 
      email, 
      username, 
      first_name, 
      last_name, 
      full_name,
      created_at, 
      updated_at, 
      has_completed_onboarding
    ) 
    VALUES (
      user_id, 
      auth_email, 
      SPLIT_PART(auth_email, '@', 1), 
      COALESCE(auth_first_name, ''),
      COALESCE(auth_last_name, ''),
      COALESCE(auth_full_name, ''),
      NOW(), 
      NOW(), 
      TRUE -- Always set onboarding to complete for Google users
    );
  ELSE
    -- Update existing profile with onboarding flag
    UPDATE profiles
    SET 
      has_completed_onboarding = TRUE,
      updated_at = NOW()
    WHERE id = user_id;
  END IF;
  
  -- Update user metadata to mark onboarding as completed
  UPDATE auth.users
  SET raw_user_meta_data = 
    raw_user_meta_data || 
    jsonb_build_object(
      'has_completed_onboarding', TRUE,
      'has_profile_created', TRUE,
      'profile_synced_at', NOW()
    )
  WHERE id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 3: Add a trigger to ensure all Google users get proper profiles
CREATE OR REPLACE FUNCTION handle_google_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is a Google user
  IF NEW.raw_app_meta_data->>'provider' = 'google' OR 
     EXISTS (
       SELECT 1 FROM auth.identities 
       WHERE user_id = NEW.id AND provider = 'google'
     )
  THEN
    -- Set metadata for Google users
    NEW.raw_user_meta_data = 
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object(
        'has_completed_onboarding', TRUE,
        'provider', 'google',
        'auth_provider_updated_at', NOW()
      );
      
    -- Ensure profile exists (async call)
    PERFORM sync_google_user_profile(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove trigger if it exists already (to avoid duplicates)
DROP TRIGGER IF EXISTS on_google_auth_user ON auth.users;

-- Create trigger for new Google users
CREATE TRIGGER on_google_auth_user
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_google_auth_user();

-- STEP 4: FIX EXISTING USERS (ONE-TIME DATA CORRECTION)
-- Update all existing Google users to have completed onboarding
-- This query finds all Google users and ensures they have both metadata and profile set correctly
DO $$
DECLARE
  google_user_id UUID;
BEGIN
  -- Process each Google user
  FOR google_user_id IN
    SELECT DISTINCT u.id
    FROM auth.users u
    LEFT JOIN auth.identities i ON u.id = i.user_id
    WHERE 
      u.raw_app_meta_data->>'provider' = 'google' OR
      i.provider = 'google'
  LOOP
    -- Fix auth metadata
    UPDATE auth.users
    SET raw_user_meta_data = 
      COALESCE(raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object(
        'has_completed_onboarding', TRUE,
        'has_profile_created', TRUE,
        'provider', 'google',
        'fixed_by_migration', TRUE
      )
    WHERE id = google_user_id;
    
    -- Ensure profile exists with correct settings
    PERFORM sync_google_user_profile(google_user_id);
  END LOOP;
  
  -- Also check for potential orphaned profiles (profiles without matching auth users)
  -- This could happen if auth.users gets deleted but profile remains
  UPDATE profiles
  SET has_completed_onboarding = TRUE
  WHERE 
    has_completed_onboarding = FALSE AND 
    EXISTS (
      SELECT 1 
      FROM auth.identities 
      WHERE user_id = profiles.id AND provider = 'google'
    );
END $$;

-- Add a function to directly fix a specific user by email if needed
CREATE OR REPLACE FUNCTION fix_google_user_by_email(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Apply fix for this specific user
  PERFORM sync_google_user_profile(user_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Run the following to fix specific problem users by email if needed:
-- SELECT fix_google_user_by_email('specific.user@gmail.com');
