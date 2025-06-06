-- Complete Supabase Database Setup Script for Planora.ai
-- This script combines schema creation, triggers, and RLS policies in the correct order
-- Updated with account deletion system, email change tracking, improved RLS policies, and email verification system
-- Execute this in the Supabase SQL Editor to set up the complete database

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT, -- IMPORTANT: No UNIQUE constraint to prevent conflicts with auth.users during email changes
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  has_completed_onboarding BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'pending_deletion', 'deleted')),
  deletion_requested_at TIMESTAMP WITH TIME ZONE,
  pending_email_change TEXT, -- Tracks pending email change during verification
  email_change_requested_at TIMESTAMP WITH TIME ZONE -- When the email change was requested
);

-- Add all potentially missing columns and their comments with error handling
DO $$
BEGIN
  -- Handle birthdate column (standard field for birth date)
  BEGIN
    -- Add birthdate column if it doesn't exist
    ALTER TABLE public.profiles ADD COLUMN birthdate DATE;
    -- Add comment once we know the column exists
    COMMENT ON COLUMN public.profiles.birthdate IS 'Standard field for storing birth date information';
    RAISE NOTICE 'Added birthdate column';
  EXCEPTION WHEN duplicate_column THEN
    -- Column already exists, still try to add comment
    BEGIN
      COMMENT ON COLUMN public.profiles.birthdate IS 'Standard field for storing birth date information';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add comment to birthdate column: %', SQLERRM;
    END;
    RAISE NOTICE 'birthdate column already exists';
  END;
  
  -- Migrate data from birthday to birthdate if birthday exists
  BEGIN
    -- First check if birthday column exists
    PERFORM column_name FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'birthday';
    
    -- If birthday exists, migrate data and drop the column
    IF FOUND THEN
      -- Migrate any existing data
      UPDATE public.profiles
      SET birthdate = birthday
      WHERE birthday IS NOT NULL AND (birthdate IS NULL OR birthdate != birthday);
      
      -- Drop the birthday column now that data is migrated
      ALTER TABLE public.profiles DROP COLUMN birthday;
      RAISE NOTICE 'Successfully migrated data from birthday to birthdate and dropped birthday column';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error during birthday migration: %', SQLERRM;
  END;
  
  -- Handle pending_email_change column
  BEGIN
    -- Check if column exists, add it if not
    ALTER TABLE public.profiles ADD COLUMN pending_email_change TEXT;
    -- Add comment once we know the column exists
    COMMENT ON COLUMN public.profiles.pending_email_change IS 'Tracks email change during verification process';
    RAISE NOTICE 'Added pending_email_change column';
  EXCEPTION WHEN duplicate_column THEN
    -- Column already exists, still try to add comment
    BEGIN
      COMMENT ON COLUMN public.profiles.pending_email_change IS 'Tracks email change during verification process';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add comment to pending_email_change column: %', SQLERRM;
    END;
    RAISE NOTICE 'pending_email_change column already exists';
  END;
  
  -- Handle email_change_requested_at column
  BEGIN
    -- Check if column exists, add it if not
    ALTER TABLE public.profiles ADD COLUMN email_change_requested_at TIMESTAMP WITH TIME ZONE;
    -- Add comment once we know the column exists
    COMMENT ON COLUMN public.profiles.email_change_requested_at IS 'Timestamp when email change was requested';
    RAISE NOTICE 'Added email_change_requested_at column';
  EXCEPTION WHEN duplicate_column THEN
    -- Column already exists, still try to add comment
    BEGIN
      COMMENT ON COLUMN public.profiles.email_change_requested_at IS 'Timestamp when email change was requested';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add comment to email_change_requested_at column: %', SQLERRM;
    END;
    RAISE NOTICE 'email_change_requested_at column already exists';
  END;
  
  -- Handle country column
  BEGIN
    -- Check if column exists, add it if not
    ALTER TABLE public.profiles ADD COLUMN country TEXT;
    -- Add comment once we know the column exists
    COMMENT ON COLUMN public.profiles.country IS 'User''s country of residence';
    RAISE NOTICE 'Added country column';
  EXCEPTION WHEN duplicate_column THEN
    -- Column already exists, still try to add comment
    BEGIN
      COMMENT ON COLUMN public.profiles.country IS 'User''s country of residence';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add comment to country column: %', SQLERRM;
    END;
    RAISE NOTICE 'country column already exists';
  END;
  
  -- Handle city column
  BEGIN
    -- Check if column exists, add it if not
    ALTER TABLE public.profiles ADD COLUMN city TEXT;
    -- Add comment once we know the column exists
    COMMENT ON COLUMN public.profiles.city IS 'User''s city of residence';
    RAISE NOTICE 'Added city column';
  EXCEPTION WHEN duplicate_column THEN
    -- Column already exists, still try to add comment
    BEGIN
      COMMENT ON COLUMN public.profiles.city IS 'User''s city of residence';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add comment to city column: %', SQLERRM;
    END;
    RAISE NOTICE 'city column already exists';
  END;
  
  -- Handle custom_city column
  BEGIN
    -- Check if column exists, add it if not
    ALTER TABLE public.profiles ADD COLUMN custom_city TEXT;
    -- Add comment once we know the column exists
    COMMENT ON COLUMN public.profiles.custom_city IS 'User''s custom city input when city is "Other"';
    RAISE NOTICE 'Added custom_city column';
  EXCEPTION WHEN duplicate_column THEN
    -- Column already exists, still try to add comment
    BEGIN
      COMMENT ON COLUMN public.profiles.custom_city IS 'User''s custom city input when city is "Other"';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add comment to custom_city column: %', SQLERRM;
    END;
    RAISE NOTICE 'custom_city column already exists';
  END;
END$$;

-- Email Change Tracking Table
CREATE TABLE IF NOT EXISTS public.email_change_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  old_email TEXT NOT NULL,
  new_email TEXT NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'failed')),
  auth_provider TEXT -- Tracks original auth provider (e.g., 'google', 'email', etc.)
);

-- Travel Preferences Table
CREATE TABLE IF NOT EXISTS public.travel_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  budget_min INTEGER DEFAULT 0,
  budget_max INTEGER DEFAULT 0,
  budget_flexibility INTEGER DEFAULT 0,
  travel_duration TEXT DEFAULT 'week',
  date_flexibility TEXT DEFAULT 'flexible-few',
  custom_date_flexibility TEXT DEFAULT '',
  planning_intent TEXT DEFAULT 'exploring',
  accommodation_types TEXT[] DEFAULT ARRAY['hotel'],
  accommodation_comfort TEXT[] DEFAULT ARRAY['private-room'],
  location_preference TEXT DEFAULT 'center',
  flight_type TEXT DEFAULT 'direct',
  prefer_cheaper_with_stopover BOOLEAN DEFAULT false,
  departure_country TEXT DEFAULT 'Germany',
  departure_city TEXT DEFAULT 'Berlin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT travel_preferences_user_id_key UNIQUE (user_id)
);

-- Account Deletion Requests Table
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  scheduled_purge_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'cancelled', 'completed')),
  purged_at TIMESTAMP WITH TIME ZONE,
  recovery_token TEXT,
  CONSTRAINT unique_active_request UNIQUE (user_id, status)
);


-- Session Storage Table for Edge Functions
-- This table is used by Edge Functions for rate limiting and other stateful operations.
CREATE TABLE IF NOT EXISTS public.session_storage (
  key TEXT PRIMARY KEY,
  value TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Create an index on expires_at for efficient cleanup of expired entries
CREATE INDEX IF NOT EXISTS session_storage_expires_at_idx ON public.session_storage(expires_at);

-- Function to clean up expired session storage entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_session_storage_entries()
RETURNS void AS $$
BEGIN
  DELETE FROM public.session_storage WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION public.cleanup_expired_session_storage_entries() IS 'Deletes expired entries from the session_storage table. Intended to be called periodically by a cron job (e.g., pg_cron).';

-- NOTE: Instead of a trigger for cleanup, which can impact performance on high-traffic tables,
-- it is generally recommended to use a scheduled job (e.g., pg_cron) to call
-- public.cleanup_expired_session_storage_entries() periodically (e.g., daily or hourly).
-- Example pg_cron setup (run this in SQL editor once pg_cron is enabled):
-- SELECT cron.schedule(''cleanup-session-storage'', ''0 * * * *'', ''SELECT public.cleanup_expired_session_storage_entries();'');
-- This schedules the cleanup to run at the start of every hour.

-- Add RLS policies
ALTER TABLE public.session_storage ENABLE ROW LEVEL SECURITY;

-- Policy for service role access (Edge Functions use service role)
DROP POLICY IF EXISTS "Service role full access for session_storage" ON public.session_storage;
CREATE POLICY "Service role full access for session_storage"
ON public.session_storage
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMENT ON TABLE public.session_storage IS 'Storage for session-related data like rate limiting for Edge Functions. Cleanup of expired entries should be handled by a scheduled job.';

-- Verification Codes Table for Email Verification
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code VARCHAR(6) NOT NULL,
  code_type TEXT NOT NULL, -- Type of verification (e.g., 'signup_verification', 'email_change')
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired', 'cancelled')), -- Status of the code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS travel_preferences_user_id_idx ON public.travel_preferences(user_id);
CREATE INDEX IF NOT EXISTS profiles_id_idx ON public.profiles(id);
CREATE INDEX IF NOT EXISTS profiles_email_verified_idx ON public.profiles(email_verified);
CREATE INDEX IF NOT EXISTS profiles_account_status_idx ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS deletion_requests_status_idx ON public.account_deletion_requests(status);
CREATE INDEX IF NOT EXISTS deletion_requests_token_idx ON public.account_deletion_requests(recovery_token);
CREATE INDEX IF NOT EXISTS email_change_user_id_idx ON public.email_change_tracking(user_id);
CREATE INDEX IF NOT EXISTS email_change_status_idx ON public.email_change_tracking(status);
CREATE INDEX IF NOT EXISTS verification_codes_user_id_idx ON public.verification_codes(user_id);
CREATE INDEX IF NOT EXISTS verification_codes_email_idx ON public.verification_codes(email);
CREATE INDEX IF NOT EXISTS verification_codes_status_idx ON public.verification_codes(status);
CREATE INDEX IF NOT EXISTS verification_codes_code_type_idx ON public.verification_codes(code_type);

-- Automatic Profile Creation Trigger
-- This ensures that when a new user signs up, a profile is automatically created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  provider text;
  is_email_verified boolean;
BEGIN
  -- Get the authentication provider if available
  provider := COALESCE(new.raw_app_meta_data->>'provider', new.raw_user_meta_data->>'provider', '');
  
  -- Log metadata for debugging (Supabase Edge Functions can view these logs)
  RAISE LOG 'New user: %, Provider: %, Raw metadata: %', new.id, provider, new.raw_user_meta_data;
  
  -- Determine if email should be marked as verified
  -- Email is verified if it's a social login or if email_confirmed_at is set
  is_email_verified := (provider != '') OR (new.email_confirmed_at IS NOT NULL);

  -- Handle profile creation with error catching
  BEGIN
    INSERT INTO public.profiles (
      id, 
      email, 
      first_name, 
      last_name, 
      birthdate,   -- Only add the primary date field
      -- birthday field has been removed, using only birthdate
      has_completed_onboarding, 
      email_verified,
      account_status,
      created_at,
      updated_at
    )
    VALUES (
      new.id, 
      new.email, 
      -- Extract first name with multiple fallbacks for Google auth
      COALESCE(
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'given_name',
        CASE 
          WHEN new.raw_user_meta_data->>'name' IS NOT NULL THEN 
            split_part(new.raw_user_meta_data->>'name', ' ', 1)
          ELSE ''
        END,
        CASE 
          WHEN new.raw_user_meta_data->>'full_name' IS NOT NULL THEN 
            split_part(new.raw_user_meta_data->>'full_name', ' ', 1)
          ELSE ''
        END,
        ''
      ), 
      -- Extract last name with multiple fallbacks for Google auth
      COALESCE(
        new.raw_user_meta_data->>'last_name',
        new.raw_user_meta_data->>'family_name',
        CASE 
          WHEN new.raw_user_meta_data->>'name' IS NOT NULL AND 
               array_length(string_to_array(new.raw_user_meta_data->>'name', ' '), 1) > 1 THEN
            (SELECT array_to_string((string_to_array(new.raw_user_meta_data->>'name', ' '))[2:], ' '))
          ELSE ''
        END,
        CASE 
          WHEN new.raw_user_meta_data->>'full_name' IS NOT NULL AND 
               array_length(string_to_array(new.raw_user_meta_data->>'full_name', ' '), 1) > 1 THEN
            (SELECT array_to_string((string_to_array(new.raw_user_meta_data->>'full_name', ' '))[2:], ' '))
          ELSE ''
        END,
        ''
      ),
      NULL, -- birthdate (standardized field)
      FALSE,
      is_email_verified,
      'active',
      now(),
      now()
    );
  EXCEPTION 
    -- If the profile already exists, do nothing (prevents duplicates)
    WHEN unique_violation THEN
      RAISE NOTICE 'Profile for user % already exists', new.id;
  END;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Ensure Row Level Security (RLS) is enabled on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_change_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid duplication errors
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own travel preferences" ON public.travel_preferences;
DROP POLICY IF EXISTS "Users can insert their own travel preferences" ON public.travel_preferences;
DROP POLICY IF EXISTS "Users can update their own travel preferences" ON public.travel_preferences;
DROP POLICY IF EXISTS "Users can delete their own travel preferences" ON public.travel_preferences;
DROP POLICY IF EXISTS "Users can read their own travel preferences" ON public.travel_preferences;
DROP POLICY IF EXISTS "Users can manage their own travel preferences" ON public.travel_preferences;
DROP POLICY IF EXISTS "Users can view their own deletion requests" ON public.account_deletion_requests;
DROP POLICY IF EXISTS "Service role can manage all deletion requests" ON public.account_deletion_requests;
DROP POLICY IF EXISTS "Users can view their own email changes" ON public.email_change_tracking;
DROP POLICY IF EXISTS "Users can insert their own email changes" ON public.email_change_tracking;
DROP POLICY IF EXISTS "Users can update their own email changes" ON public.email_change_tracking;
DROP POLICY IF EXISTS "Service role can manage email changes" ON public.email_change_tracking;
DROP POLICY IF EXISTS "Users can view their own email changes" ON public.email_change_tracking;
DROP POLICY IF EXISTS "Users can manage their own email changes" ON public.email_change_tracking;
DROP POLICY IF EXISTS "Service role can manage all email changes" ON public.email_change_tracking;
DROP POLICY IF EXISTS "Users can read their own verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Service role has full access to verification codes" ON public.verification_codes;

-- Create policies for the profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id);

-- Create policies for travel_preferences table
CREATE POLICY "Users can view their own travel preferences" 
ON public.travel_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own travel preferences" 
ON public.travel_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own travel preferences" 
ON public.travel_preferences 
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own travel preferences" 
ON public.travel_preferences 
FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for account_deletion_requests table
CREATE POLICY "Users can view their own deletion requests" 
ON public.account_deletion_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all deletion requests" 
ON public.account_deletion_requests 
USING (auth.role() = 'service_role');

-- Create policies for email_change_tracking table
CREATE POLICY "Users can view their own email changes" 
ON public.email_change_tracking 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email changes" 
ON public.email_change_tracking 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email changes" 
ON public.email_change_tracking 
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage email changes" 
ON public.email_change_tracking 
USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage their own email changes" 
ON public.email_change_tracking 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all email changes" 
ON public.email_change_tracking 
USING (auth.role() = 'service_role');

-- Create policies for verification codes
CREATE POLICY "Users can read their own verification codes" 
ON public.verification_codes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to verification codes" 
ON public.verification_codes 
USING (true)
WITH CHECK (true);

-- Service role access policies (for administrative functions)
DROP POLICY IF EXISTS "Service role can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert any profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can update any profile" ON public.profiles;

CREATE POLICY "Service role can view all profiles"
ON public.profiles
FOR SELECT
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can insert any profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update any profile"
ON public.profiles
FOR UPDATE
USING (auth.role() = 'service_role');

-- Verify setup and tables
SELECT 
  table_name, 
  (SELECT count(*) FROM information_schema.triggers WHERE event_object_table = table_name) as trigger_count
FROM 
  information_schema.tables 
WHERE 
  table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('profiles', 'travel_preferences', 'account_deletion_requests', 'email_change_tracking', 'verification_codes');

-- Safe column addition procedure
-- This ensures we gracefully add columns if they don't exist
DO $$
DECLARE
  column_exists boolean;
BEGIN
    -- Check and add pending_email_change column if it doesn't exist
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'pending_email_change'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE public.profiles ADD COLUMN pending_email_change TEXT;
        RAISE NOTICE 'Added pending_email_change column to profiles table';
    END IF;
    
    -- Check and add email_change_requested_at column if it doesn't exist
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email_change_requested_at'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE public.profiles ADD COLUMN email_change_requested_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added email_change_requested_at column to profiles table';
    END IF;
END $$;

-- Set email_verified for all Google-authenticated accounts
DO $$
BEGIN
    -- Verify that birthdate column exists (should be added in earlier steps)
    BEGIN
        -- Add birthdate column if it doesn't exist as a final safety check
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'birthdate'
        );
        
        IF NOT FOUND THEN
            ALTER TABLE public.profiles ADD COLUMN birthdate DATE;
            RAISE NOTICE 'Added birthdate column as final safety check';
        END IF;
    
        -- Set email_verified for all Google-authenticated accounts
        UPDATE public.profiles AS p
        SET email_verified = TRUE
        FROM auth.users AS u
        WHERE p.id = u.id AND (u.raw_app_meta_data->>'provider' = 'google' OR u.raw_user_meta_data->>'provider' = 'google');
        
        RAISE NOTICE 'Successfully set email_verified flag for Google accounts';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error updating email verification status: %', SQLERRM;
    END;
END $$;

-- Note about the birthdate field standardization
DO $$
BEGIN
    RAISE NOTICE 'Database schema updated: birthdate is now the only field for birth dates. The birthday field has been removed.';
END $$;

-- Function to generate a verification code for a user
CREATE OR REPLACE FUNCTION public.generate_verification_code(user_id UUID, user_email TEXT)
RETURNS VARCHAR AS $$
DECLARE
  verification_code VARCHAR(6);
BEGIN
  -- Generate random 6-digit code
  verification_code := lpad(floor(random() * 1000000)::text, 6, '0');
  
  -- Expire any previous codes for this user
  UPDATE public.verification_codes 
  SET used = TRUE 
  WHERE user_id = $1 AND used = FALSE;
  
  -- Insert new code
  INSERT INTO public.verification_codes (
    user_id, 
    email, 
    code, 
    expires_at
  ) VALUES (
    $1, 
    $2, 
    verification_code, 
    now() + interval '1 hour'
  );
  
  RETURN verification_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- Rate Limit Storage Table
-- Stores rate limiting counters and timestamps for various actions.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rate_limit_storage (
    key TEXT PRIMARY KEY,
    value JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.rate_limit_storage IS 'Stores rate limiting counters and timestamps for various actions (e.g., email verification sends, code checks).';
COMMENT ON COLUMN public.rate_limit_storage.key IS 'Unique key identifying the rate-limited action and user/entity (e.g., verification_code_send:user_id@example.com).';
COMMENT ON COLUMN public.rate_limit_storage.value IS 'JSONB object storing count and last attempt timestamp, e.g., { "count": 1, "lastAttempt": "2023-01-01T12:00:00Z" }.';

-- Enable RLS
ALTER TABLE public.rate_limit_storage ENABLE ROW LEVEL SECURITY;

-- Policies for rate_limit_storage
-- Service roles can bypass RLS
DROP POLICY IF EXISTS "Allow service_role to access rate_limit_storage" ON public.rate_limit_storage;
CREATE POLICY "Allow service_role to access rate_limit_storage"
ON public.rate_limit_storage
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Authenticated users should not directly access this table; it's managed by Edge Functions.
DROP POLICY IF EXISTS "Disallow direct access for authenticated users on rate_limit_storage" ON public.rate_limit_storage;
CREATE POLICY "Disallow direct access for authenticated users on rate_limit_storage"
ON public.rate_limit_storage
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (false);

DROP POLICY IF EXISTS "Disallow anon access for rate_limit_storage" ON public.rate_limit_storage;
CREATE POLICY "Disallow anon access for rate_limit_storage"
ON public.rate_limit_storage
FOR ALL
USING (auth.role() = 'anon')
WITH CHECK (false);


-- Trigger to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.handle_rate_limit_storage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_rate_limit_storage_updated ON public.rate_limit_storage;
CREATE TRIGGER on_rate_limit_storage_updated
BEFORE UPDATE ON public.rate_limit_storage
FOR EACH ROW
EXECUTE FUNCTION public.handle_rate_limit_storage_updated_at();


-- Verify successful schema updates
DO $$
BEGIN
  RAISE NOTICE 'Supabase schema setup completed successfully for Planora.ai!';
END$$;