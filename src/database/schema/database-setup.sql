-- Complete Supabase Database Setup Script for Planora.ai
-- This script combines schema creation, triggers, and RLS policies in the correct order
-- Execute this in the Supabase SQL Editor to set up the complete database

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  birthday DATE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  has_completed_onboarding BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE
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

-- Automatic Profile Creation Trigger
-- This ensures that when a new user signs up, a profile is automatically created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, first_name, last_name, birthday, 
    has_completed_onboarding, email_verified
  )
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'first_name', ''), 
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    NULL,
    FALSE,
    -- Check if email is already confirmed in auth.users
    new.email_confirmed_at IS NOT NULL
  );
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

-- Drop existing policies to avoid duplication errors
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own travel preferences" ON public.travel_preferences;
DROP POLICY IF EXISTS "Users can insert their own travel preferences" ON public.travel_preferences;
DROP POLICY IF EXISTS "Users can update their own travel preferences" ON public.travel_preferences;
DROP POLICY IF EXISTS "Users can delete their own travel preferences" ON public.travel_preferences;

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
  AND table_name IN ('profiles', 'travel_preferences');
