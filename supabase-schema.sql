-- Consolidated Supabase Schema for Planora
-- This file contains all tables, indexes, and RLS policies

-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  has_completed_onboarding BOOLEAN DEFAULT FALSE
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
