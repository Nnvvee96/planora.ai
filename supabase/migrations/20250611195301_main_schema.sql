-- Supabase Database Setup for Planora.ai
-- Version: 2.1
-- Last Updated: 2024-05-20
-- Description: This script sets up the initial database schema for Planora.ai,
-- including profiles, travel preferences, account deletion, email verification,
-- and necessary triggers and RLS policies.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Disable RLS for the 'postgres' user to prevent access issues during setup
ALTER ROLE postgres SET pgrst.db_pre_request = '';

-- Create Profiles Table
-- Stores public user information.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  birthdate DATE, -- Standardized to birthdate
  has_completed_onboarding BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE, -- Tracks if the user's email has been verified
  general_country TEXT, -- User's general country of residence
  general_city TEXT,    -- User's general city of residence
  onboarding_departure_country TEXT, -- User's departure country set during onboarding
  onboarding_departure_city TEXT,    -- User's departure city set during onboarding
  deactivated_at TIMESTAMP WITH TIME ZONE, -- Tracks when a user account is deactivated for scheduled deletion
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
COMMENT ON TABLE public.profiles IS 'Stores public user profile information linked to auth.users.';
COMMENT ON COLUMN public.profiles.general_country IS 'User''s general country of residence.';
COMMENT ON COLUMN public.profiles.general_city IS 'User''s general city of residence.';
COMMENT ON COLUMN public.profiles.onboarding_departure_country IS 'User''s departure country set during onboarding.';
COMMENT ON COLUMN public.profiles.onboarding_departure_city IS 'User''s departure city set during onboarding.';
COMMENT ON COLUMN public.profiles.deactivated_at IS 'Tracks when a user account is deactivated for scheduled deletion.';

-- Create Travel Preferences Table
-- Stores user preferences for travel planning.
CREATE TABLE IF NOT EXISTS public.travel_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  trip_duration_min INTEGER,
  trip_duration_max INTEGER,
  budget_range_min INTEGER,
  budget_range_max INTEGER,
  travel_style TEXT, -- e.g., 'adventure', 'relaxation', 'cultural'
  activity_level TEXT, -- e.g., 'low', 'medium', 'high'
  accommodation_type TEXT, -- e.g., 'hotel', 'hostel', 'airbnb'
  destination_type TEXT, -- e.g., 'city', 'beach', 'mountains'
  custom_date_flexibility TEXT, -- e.g., 'exact_dates', 'flexible_week', 'flexible_month'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT budget_check CHECK (budget_range_min <= budget_range_max),
  CONSTRAINT duration_check CHECK (trip_duration_min <= trip_duration_max)
);
COMMENT ON TABLE public.travel_preferences IS 'Stores user-specific travel preferences for trip planning.';

-- Create Account Deletion Requests Table

-- Create Email Change Tracking Table
-- Stores tracking information for email change requests.
CREATE TABLE IF NOT EXISTS public.email_change_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  old_email TEXT,
  new_email TEXT,
  token TEXT UNIQUE, -- Stores the verification token for the new email
  token_expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- e.g., 'pending', 'verified', 'expired', 'completed'
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  verified_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT check_email_change_status CHECK (status IN ('pending', 'verified', 'expired', 'completed'))
);
COMMENT ON TABLE public.email_change_tracking IS 'Tracks email change requests and their verification status.';

-- Create Session Storage Table
-- For storing arbitrary session data if needed, e.g., for multi-step flows.
CREATE TABLE IF NOT EXISTS public.session_storage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_key TEXT NOT NULL,
  session_data JSONB,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE (user_id, session_key)
);
COMMENT ON TABLE public.session_storage IS 'Stores temporary session data for users.';

-- Create Verification Codes Table
-- Stores codes for various verification purposes (e.g., email, phone, 2FA).
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  code_type TEXT NOT NULL, -- e.g., 'EMAIL_VERIFICATION', 'PASSWORD_RESET', 'TWO_FACTOR_SETUP'
  code TEXT NOT NULL,
  target TEXT NOT NULL, -- e.g., email address, phone number
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  metadata JSONB, -- Stores temporary metadata, such as a pending password
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE (user_id, code_type, target) -- Ensure a user has only one active code of a certain type for a target
);
COMMENT ON TABLE public.verification_codes IS 'Stores various types of verification codes for users.';

-- Triggers and Functions --

-- Function to create a public profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, avatar_url, has_completed_onboarding, email_verified, general_country, general_city)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name', 
    NEW.raw_user_meta_data->>'last_name',   
    NEW.raw_user_meta_data->>'avatar_url',  
    COALESCE((NEW.raw_user_meta_data->>'has_completed_onboarding')::BOOLEAN, FALSE),
    NEW.email_confirmed_at IS NOT NULL, -- Set email_verified based on email_confirmed_at
    NEW.raw_user_meta_data->>'general_country',
    NEW.raw_user_meta_data->>'general_city'
  );
  RETURN NEW;
END;
$$;
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a profile entry when a new user signs up.';

-- Trigger to call handle_new_user on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update the 'updated_at' timestamp on profile modification
CREATE OR REPLACE FUNCTION public.update_profile_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$;
COMMENT ON FUNCTION public.update_profile_updated_at_column() IS 'Updates the updated_at timestamp on profile changes.';

-- Trigger for profile updated_at timestamp
DROP TRIGGER IF EXISTS before_profile_update ON public.profiles;
CREATE TRIGGER before_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_updated_at_column();

-- Function to update the 'updated_at' timestamp on travel_preferences modification
CREATE OR REPLACE FUNCTION public.update_travel_preferences_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$;
COMMENT ON FUNCTION public.update_travel_preferences_updated_at_column() IS 'Updates the updated_at timestamp on travel preferences changes.';

-- Trigger for travel_preferences updated_at timestamp
DROP TRIGGER IF EXISTS before_travel_preferences_update ON public.travel_preferences;
CREATE TRIGGER before_travel_preferences_update
  BEFORE UPDATE ON public.travel_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_travel_preferences_updated_at_column();

-- Function to update the 'updated_at' timestamp on verification_codes modification
CREATE OR REPLACE FUNCTION public.update_verification_codes_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$;
COMMENT ON FUNCTION public.update_verification_codes_updated_at_column() IS 'Updates the updated_at timestamp on verification_codes changes.';

-- Trigger for verification_codes updated_at timestamp
DROP TRIGGER IF EXISTS before_verification_codes_update ON public.verification_codes;
CREATE TRIGGER before_verification_codes_update
  BEFORE UPDATE ON public.verification_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_verification_codes_updated_at_column();

-- Function to handle user deletion cleanup
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Delete related data from other tables. Profiles table has ON DELETE CASCADE.
  DELETE FROM public.travel_preferences WHERE user_id = OLD.id;
  DELETE FROM public.email_change_tracking WHERE user_id = OLD.id;
  DELETE FROM public.session_storage WHERE user_id = OLD.id;
  DELETE FROM public.verification_codes WHERE user_id = OLD.id;
  -- Add more cleanup for other related tables as needed
  RETURN OLD;
END;
$$;
COMMENT ON FUNCTION public.handle_user_deletion() IS 'Cleans up user-related data upon account deletion from auth.users.';

-- Trigger to call handle_user_deletion before a user is deleted from auth.users
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();

-- Function to update user's email in profiles table when changed in auth.users
CREATE OR REPLACE FUNCTION public.handle_user_email_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles
    SET email = NEW.email,
        email_verified = NEW.email_confirmed_at IS NOT NULL, -- Update verification status
        updated_at = TIMEZONE('utc', NOW())
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
COMMENT ON FUNCTION public.handle_user_email_change() IS 'Updates the email in profiles table when auth.users email changes.';

-- Trigger for user email change
DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_email_change();

-- Function to update email_verified in profiles when email_confirmed_at changes in auth.users
CREATE OR REPLACE FUNCTION public.handle_email_confirmation_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS DISTINCT FROM OLD.email_confirmed_at THEN
    UPDATE public.profiles
    SET email_verified = (NEW.email_confirmed_at IS NOT NULL),
        updated_at = TIMEZONE('utc', NOW())
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
COMMENT ON FUNCTION public.handle_email_confirmation_change() IS 'Updates email_verified in profiles based on auth.users.email_confirmed_at.';

-- Trigger for email confirmation status change
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed_at_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed_at_updated
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_confirmation_change();


-- Stored procedure to request email change and generate verification token
CREATE OR REPLACE FUNCTION public.request_email_change(p_user_id UUID, p_new_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _token TEXT;
  _token_expires_at TIMESTAMP WITH TIME ZONE;
  _old_email TEXT;
BEGIN
  -- Validate new email format (basic check)
  IF p_new_email IS NULL OR p_new_email !~ '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid email format.');
  END IF;

  -- Check if new email is already in use by another user in auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_new_email AND id != p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'New email address is already in use.');
  END IF;

  -- Get current email
  SELECT email INTO _old_email FROM auth.users WHERE id = p_user_id;

  -- Check if new email is the same as the current one
  IF _old_email = p_new_email THEN
     RETURN jsonb_build_object('success', false, 'error', 'New email is the same as the current email.');
  END IF;

  -- Generate a unique token and expiry
  _token := extensions.uuid_generate_v4()::TEXT; -- Using UUID as a simple token
  _token_expires_at := TIMEZONE('utc', NOW()) + INTERVAL '1 hour';

  -- Store the email change request
  INSERT INTO public.email_change_tracking (user_id, old_email, new_email, token, token_expires_at, status)
  VALUES (p_user_id, _old_email, p_new_email, _token, _token_expires_at, 'pending')
  ON CONFLICT (user_id, new_email) WHERE status = 'pending' -- Example: allow re-request if previous expired or was different
  DO UPDATE SET
    token = EXCLUDED.token,
    token_expires_at = EXCLUDED.token_expires_at,
    requested_at = TIMEZONE('utc', NOW());

  -- Return token and expiry (in a real app, you'd email this token)
  RETURN jsonb_build_object('success', true, 'token', _token, 'expires_at', _token_expires_at, 'new_email', p_new_email);
END;
$$;
COMMENT ON FUNCTION public.request_email_change(UUID, TEXT) IS 'Initiates an email change request, generates a token, and stores it.';

-- Stored procedure to confirm email change using a token
CREATE OR REPLACE FUNCTION public.confirm_email_change(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _request RECORD;
BEGIN
  -- Find the request by token
  SELECT * INTO _request FROM public.email_change_tracking
  WHERE token = p_token AND status = 'pending' AND token_expires_at > TIMEZONE('utc', NOW());

  IF NOT FOUND THEN
    -- Update expired or invalid tokens for cleanup if necessary
    UPDATE public.email_change_tracking
    SET status = 'expired'
    WHERE token = p_token AND status = 'pending' AND token_expires_at <= TIMEZONE('utc', NOW());
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired token.');
  END IF;

  -- Update the user's email in auth.users
  -- This requires admin privileges, which SECURITY DEFINER provides for this function context.
  UPDATE auth.users
  SET email = _request.new_email,
      email_confirmed_at = TIMEZONE('utc', NOW()) -- Mark new email as confirmed
  WHERE id = _request.user_id;

  IF NOT FOUND THEN
    -- Should not happen if request was found, but as a safeguard
    UPDATE public.email_change_tracking SET status = 'failed_auth_update' WHERE id = _request.id;
    RETURN jsonb_build_object('success', false, 'error', 'Failed to update user authentication record.');
  END IF;

  -- Update the tracking record
  UPDATE public.email_change_tracking
  SET status = 'completed', verified_at = TIMEZONE('utc', NOW())
  WHERE id = _request.id;

  -- The trigger on_auth_user_email_updated will handle updating public.profiles.email

  RETURN jsonb_build_object('success', true, 'message', 'Email address successfully updated.');
END;
$$;
COMMENT ON FUNCTION public.confirm_email_change(TEXT) IS 'Confirms an email change using a verification token and updates auth.users.';

-- Stored procedure to create a verification code
CREATE OR REPLACE FUNCTION public.create_verification_code(p_user_id UUID, p_code_type TEXT, p_target TEXT, p_duration_minutes INTEGER DEFAULT 15)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _code TEXT;
  _expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate a 6-digit numeric code (example)
  _code := LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
  _expires_at := TIMEZONE('utc', NOW()) + (p_duration_minutes * INTERVAL '1 minute');

  -- Invalidate previous active codes of the same type for the same target and user
  UPDATE public.verification_codes
  SET used = TRUE, updated_at = TIMEZONE('utc', NOW())
  WHERE user_id = p_user_id AND code_type = p_code_type AND target = p_target AND used = FALSE AND expires_at > TIMEZONE('utc', NOW());

  -- Insert the new code
  INSERT INTO public.verification_codes (user_id, code_type, code, target, expires_at)
  VALUES (p_user_id, p_code_type, _code, p_target, _expires_at);

  RETURN jsonb_build_object('success', true, 'code', _code, 'expires_at', _expires_at, 'target', p_target, 'code_type', p_code_type);
END;
$$;
COMMENT ON FUNCTION public.create_verification_code(UUID, TEXT, TEXT, INTEGER) IS 'Creates and stores a new verification code for a user, invalidating previous ones.';

-- Stored procedure to verify a code
CREATE OR REPLACE FUNCTION public.verify_code(p_user_id UUID, p_code_type TEXT, p_target TEXT, p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _verification_record RECORD;
BEGIN
  SELECT * INTO _verification_record FROM public.verification_codes
  WHERE user_id = p_user_id
    AND code_type = p_code_type
    AND target = p_target
    AND code = p_code
    AND used = FALSE
    AND expires_at > TIMEZONE('utc', NOW());

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid, expired, or already used code.');
  END IF;

  -- Mark code as used
  UPDATE public.verification_codes
  SET used = TRUE, updated_at = TIMEZONE('utc', NOW())
  WHERE id = _verification_record.id;

  RETURN jsonb_build_object('success', true, 'message', 'Code verified successfully.');
END;
$$;
COMMENT ON FUNCTION public.verify_code(UUID, TEXT, TEXT, TEXT) IS 'Verifies a given code for a user, type, and target.';


-- RLS Policies --

-- Enable RLS for all relevant tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_change_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Travel Preferences RLS
DROP POLICY IF EXISTS "Allow users to manage their own travel preferences" ON public.travel_preferences;
CREATE POLICY "Allow users to manage their own travel preferences" ON public.travel_preferences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Email Change Tracking RLS
DROP POLICY IF EXISTS "Allow users to manage their own email change requests" ON public.email_change_tracking;
CREATE POLICY "Allow users to manage their own email change requests" ON public.email_change_tracking FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow service role to manage all email change requests" ON public.email_change_tracking;
CREATE POLICY "Allow service role to manage all email change requests" ON public.email_change_tracking FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Session Storage RLS
DROP POLICY IF EXISTS "Allow users to manage their own session data" ON public.session_storage;
CREATE POLICY "Allow users to manage their own session data" ON public.session_storage FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Verification Codes RLS
DROP POLICY IF EXISTS "Allow users to manage their own verification codes" ON public.verification_codes;
CREATE POLICY "Allow users to manage their own verification codes" ON public.verification_codes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow service role to manage all verification codes" ON public.verification_codes;
CREATE POLICY "Allow service role to manage all verification codes" ON public.verification_codes FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Grant usage on schema public to supabase_auth_admin (used by Edge Functions)
-- This is important for Edge Functions that need to operate on these tables with elevated privileges.
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO supabase_auth_admin;

-- Grant usage for authenticated users (for RLS to apply)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
-- Explicitly grant execute on specific functions callable by users
GRANT EXECUTE ON FUNCTION public.request_email_change(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_email_change(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_verification_code(UUID, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_code(UUID, TEXT, TEXT, TEXT) TO authenticated;


-- Grant usage for anon users (if any public data or functions are available)
GRANT USAGE ON SCHEMA public TO anon;
-- Example: GRANT SELECT ON public.some_public_table TO anon;

-- Final setup: Re-enable RLS for 'postgres' user if it was disabled for setup
-- This step might be environment-specific or handled by Supabase's dashboard.
-- ALTER ROLE postgres RESET pgrst.db_pre_request;


-- Migration for birthdate field (if 'birthday' column exists from an older schema version)
-- This section attempts to migrate data from 'birthday' to 'birthdate' and then drop 'birthday'.
DO $$ 
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'birthday') THEN
    RAISE NOTICE 'Attempting to migrate data from birthday to birthdate column in public.profiles';
    
    -- Add birthdate column if it doesn't exist (it should, based on schema above, but as a safeguard)
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'birthdate') THEN
      ALTER TABLE public.profiles ADD COLUMN birthdate DATE;
      RAISE NOTICE 'Added birthdate column to public.profiles.';
    END IF;

    -- Migrate data only if birthdate is NULL and birthday is NOT NULL
    UPDATE public.profiles
    SET birthdate = birthday::DATE
    WHERE birthdate IS NULL AND birthday IS NOT NULL;
    
    RAISE NOTICE 'Data migration from birthday to birthdate attempted. Check table for results.';
    
    -- Optionally, drop the old birthday column after verification
    -- For safety, this is commented out. Run manually after confirming migration.
    -- ALTER TABLE public.profiles DROP COLUMN birthday;
    -- RAISE NOTICE 'Dropped birthday column from public.profiles.';
  ELSE
    RAISE NOTICE 'Column birthday does not exist in public.profiles, no migration needed.';
  END IF;
END $$;


-- Appended content from unified-user-data-update.sql
-- Unified user data update stored procedure
-- This stored procedure provides a centralized way to update user data across multiple tables
-- It follows Planora's architectural principles by reducing redundancy and centralizing logic
CREATE OR REPLACE FUNCTION update_user_data_unified(
  p_user_id UUID,
  p_profile_data JSONB DEFAULT NULL,
  p_user_metadata JSONB DEFAULT NULL,
  p_travel_preferences JSONB DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_profile_updated BOOLEAN := FALSE;
  v_metadata_updated BOOLEAN := FALSE;
  v_preferences_updated BOOLEAN := FALSE;
BEGIN
  -- Update profile if data provided
  IF p_profile_data IS NOT NULL AND p_profile_data != '{}' THEN
    UPDATE public.profiles
    SET
      first_name = COALESCE(p_profile_data->>'firstName', first_name),
      last_name = COALESCE(p_profile_data->>'lastName', last_name),
      email = COALESCE(p_profile_data->>'email', email),
      avatar_url = COALESCE(p_profile_data->>'avatarUrl', avatar_url),
      birthdate = CASE WHEN p_profile_data->>'birthdate' IS NOT NULL 
                      THEN (p_profile_data->>'birthdate')::DATE 
                      ELSE birthdate END,
      has_completed_onboarding = CASE WHEN p_profile_data->>'hasCompletedOnboarding' IS NOT NULL 
                                     THEN (p_profile_data->>'hasCompletedOnboarding')::BOOLEAN 
                                     ELSE has_completed_onboarding END,
      email_verified = CASE WHEN p_profile_data->>'emailVerified' IS NOT NULL 
                           THEN (p_profile_data->>'emailVerified')::BOOLEAN 
                           ELSE email_verified END,
      general_country = COALESCE(p_profile_data->>'generalCountry', general_country),
      general_city = COALESCE(p_profile_data->>'generalCity', general_city),
      onboarding_departure_country = COALESCE(p_profile_data->>'onboardingDepartureCountry', onboarding_departure_country),
      onboarding_departure_city = COALESCE(p_profile_data->>'onboardingDepartureCity', onboarding_departure_city),
      updated_at = NOW()
    WHERE id = p_user_id;
    
    IF FOUND THEN
      v_profile_updated := TRUE;
    END IF;
  END IF;
  
  IF p_travel_preferences IS NOT NULL AND p_travel_preferences != '{}' THEN
    INSERT INTO public.travel_preferences (
      user_id,
      trip_duration_min,
      trip_duration_max,
      budget_range_min,
      budget_range_max,
      travel_style,
      activity_level,
      accommodation_type,
      destination_type,
      custom_date_flexibility
    ) VALUES (
      p_user_id,
      (p_travel_preferences->>'tripDurationMin')::INTEGER,
      (p_travel_preferences->>'tripDurationMax')::INTEGER,
      (p_travel_preferences->>'budgetRangeMin')::INTEGER,
      (p_travel_preferences->>'budgetRangeMax')::INTEGER,
      p_travel_preferences->>'travelStyle',
      p_travel_preferences->>'activityLevel',
      p_travel_preferences->>'accommodationType',
      p_travel_preferences->>'destinationType',
      p_travel_preferences->>'customDateFlexibility'
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      trip_duration_min = EXCLUDED.trip_duration_min,
      trip_duration_max = EXCLUDED.trip_duration_max,
      budget_range_min = EXCLUDED.budget_range_min,
      budget_range_max = EXCLUDED.budget_range_max,
      travel_style = EXCLUDED.travel_style,
      activity_level = EXCLUDED.activity_level,
      accommodation_type = EXCLUDED.accommodation_type,
      destination_type = EXCLUDED.destination_type,
      custom_date_flexibility = EXCLUDED.custom_date_flexibility,
      updated_at = NOW();
      
    IF FOUND THEN
      v_preferences_updated := TRUE;
    END IF;
  END IF;

  v_result := jsonb_build_object(
    'profile_updated', v_profile_updated,
    'metadata_updated', v_metadata_updated, -- This remains false as per original function
    'preferences_updated', v_preferences_updated
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_user_data_unified IS 'Unified function to update user data across multiple tables';
