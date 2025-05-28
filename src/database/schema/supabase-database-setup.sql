-- Complete Supabase Database Setup Script for Planora.ai
-- This script combines schema creation, triggers, and RLS policies in the correct order
-- Updated with account deletion system, improved RLS policies, and standardized date fields
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
  deletion_requested_at TIMESTAMP WITH TIME ZONE
);

-- Add comment documenting our standard
COMMENT ON COLUMN public.profiles.birthdate IS 'Standard date field for storing birth date information';
COMMENT ON COLUMN public.profiles.birthday IS 'DEPRECATED: Use birthdate instead. Kept for backward compatibility.';

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS travel_preferences_user_id_idx ON public.travel_preferences(user_id);
CREATE INDEX IF NOT EXISTS profiles_id_idx ON public.profiles(id);
CREATE INDEX IF NOT EXISTS profiles_email_verified_idx ON public.profiles(email_verified);
CREATE INDEX IF NOT EXISTS profiles_account_status_idx ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS deletion_requests_status_idx ON public.account_deletion_requests(status);
CREATE INDEX IF NOT EXISTS deletion_requests_token_idx ON public.account_deletion_requests(recovery_token);

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
  AND table_name IN ('profiles', 'travel_preferences', 'account_deletion_requests');

-- Now that all schema changes are committed, sync the birthday/birthdate columns
-- This ensures the columns exist before trying to update them
DO $$
BEGIN
    -- First ensure the columns exist to avoid errors
    BEGIN
        -- Standardize on birthdate - copy from birthday if birthdate is missing
        UPDATE public.profiles 
        SET birthdate = birthday 
        WHERE birthday IS NOT NULL AND (birthdate IS NULL OR birthdate != birthday);
        
        -- Then sync from birthdate to birthday for backward compatibility
        UPDATE public.profiles 
        SET birthday = birthdate 
        WHERE birthdate IS NOT NULL AND (birthday IS NULL OR birthday != birthdate);
        
        RAISE NOTICE 'Successfully synced birthday/birthdate columns';
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
