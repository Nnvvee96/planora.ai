-- Complete Supabase Database Setup Script for Planora.ai
-- This script combines schema creation, triggers, and RLS policies in the correct order
-- Updated with account deletion system, email change tracking, and improved RLS policies
-- Execute this in the Supabase SQL Editor to set up the complete database

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  birthdate DATE, -- Standard date field for birth date
  birthday DATE,  -- Kept for compatibility but will be deprecated
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

-- Add comments documenting our standards
COMMENT ON COLUMN public.profiles.birthdate IS 'Standard date field for storing birth date information';
COMMENT ON COLUMN public.profiles.birthday IS 'DEPRECATED: Use birthdate instead. Kept for backward compatibility.';
COMMENT ON COLUMN public.profiles.pending_email_change IS 'Tracks email change during verification process';
COMMENT ON COLUMN public.profiles.email_change_requested_at IS 'Timestamp when email change was requested';

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS travel_preferences_user_id_idx ON public.travel_preferences(user_id);
CREATE INDEX IF NOT EXISTS profiles_id_idx ON public.profiles(id);
CREATE INDEX IF NOT EXISTS profiles_email_verified_idx ON public.profiles(email_verified);
CREATE INDEX IF NOT EXISTS profiles_account_status_idx ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS deletion_requests_status_idx ON public.account_deletion_requests(status);
CREATE INDEX IF NOT EXISTS deletion_requests_token_idx ON public.account_deletion_requests(recovery_token);
CREATE INDEX IF NOT EXISTS email_change_user_id_idx ON public.email_change_tracking(user_id);
CREATE INDEX IF NOT EXISTS email_change_status_idx ON public.email_change_tracking(status);

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
      birthday,    -- Keep for compatibility
      has_completed_onboarding, 
      email_verified,
      account_status,
      created_at,
      updated_at
    )
    VALUES (
      new.id, 
      new.email, 
      COALESCE(new.raw_user_meta_data->>'first_name', ''), 
      COALESCE(new.raw_user_meta_data->>'last_name', ''),
      NULL,
      NULL,
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

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_change_tracking ENABLE ROW LEVEL SECURITY;

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

-- Create policies for email_change_tracking table
CREATE POLICY "Users can view their own email changes" 
ON public.email_change_tracking 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own email changes" 
ON public.email_change_tracking 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all email changes" 
ON public.email_change_tracking 
USING (auth.role() = 'service_role');

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
  AND table_name IN ('profiles', 'travel_preferences', 'account_deletion_requests', 'email_change_tracking');

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

-- Now that all schema changes are committed, handle birthday/birthdate columns safely
DO $$
DECLARE
    birthdate_exists boolean;
    birthday_exists boolean;
BEGIN
    -- Check if columns exist
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'birthdate'
    ) INTO birthdate_exists;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'birthday'
    ) INTO birthday_exists;
    
    -- Add columns if they don't exist
    IF NOT birthdate_exists THEN
        ALTER TABLE public.profiles ADD COLUMN birthdate DATE;
        RAISE NOTICE 'Added birthdate column to profiles table';
    END IF;
    
    IF NOT birthday_exists THEN
        ALTER TABLE public.profiles ADD COLUMN birthday DATE;
        RAISE NOTICE 'Added birthday column to profiles table';
    END IF;
    
    -- Now we can safely sync the columns
    BEGIN
        -- Sync from birthday to birthdate
        UPDATE public.profiles 
        SET birthdate = birthday 
        WHERE birthday IS NOT NULL AND birthdate IS NULL;
        
        -- Then sync from birthdate to birthday
        UPDATE public.profiles 
        SET birthday = birthdate 
        WHERE birthdate IS NOT NULL AND birthday IS NULL;
        
        -- Set email_verified for all Google-authenticated accounts
        UPDATE public.profiles AS p
        SET email_verified = TRUE
        FROM auth.users AS u
        WHERE p.id = u.id AND (u.raw_app_meta_data->>'provider' = 'google' OR u.raw_user_meta_data->>'provider' = 'google');
        
        RAISE NOTICE 'Successfully synced birthday/birthdate columns and set email_verified';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error syncing columns: %', SQLERRM;
    END;
END $$;

-- Create a compatibility view for applications still using the birthday field
CREATE OR REPLACE VIEW public.profile_compatibility AS
SELECT 
  id,
  first_name,
  last_name,
  email,
  birthdate,
  birthdate AS birthday, -- Map birthdate to birthday for backward compatibility
  avatar_url,
  created_at,
  updated_at,
  has_completed_onboarding,
  email_verified,
  account_status,
  deletion_requested_at
FROM public.profiles;

-- Notify about the date field standardization
DO $$
BEGIN
    RAISE NOTICE 'Database schema updated: birthdate is now the standard field for birth dates. The birthday field is kept for backward compatibility but will be deprecated in a future update.';
END $$;
