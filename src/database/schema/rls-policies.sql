/**
 * Comprehensive RLS Policies and Schema Updates
 * Following Planora's architectural principles and consistent standards
 */

----------------
-- STEP 1: Fix profiles table columns and data
----------------

-- Safely add birthday and birthdate columns if they don't exist
DO $$
BEGIN
    -- Check if birthday column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'profiles' 
                  AND column_name = 'birthday') THEN
        ALTER TABLE public.profiles ADD COLUMN birthday DATE;
    END IF;
    
    -- Check if birthdate column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'profiles' 
                  AND column_name = 'birthdate') THEN
        ALTER TABLE public.profiles ADD COLUMN birthdate DATE;
    END IF;

    -- Only attempt data migration if both columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'profiles' 
              AND column_name = 'birthday') AND
       EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'profiles' 
              AND column_name = 'birthdate') THEN
        
        -- Sync data between birthday and birthdate
        UPDATE public.profiles 
        SET birthdate = birthday 
        WHERE birthday IS NOT NULL AND (birthdate IS NULL OR birthdate != birthday);
        
        UPDATE public.profiles 
        SET birthday = birthdate 
        WHERE birthdate IS NOT NULL AND (birthday IS NULL OR birthday != birthdate);
    END IF;
    
    -- Check if email_verified column exists and add it if it doesn't
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'profiles' 
                  AND column_name = 'email_verified') THEN
        ALTER TABLE public.profiles ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Set email_verified for all profiles (we'll handle specifics in application code)
    UPDATE public.profiles SET email_verified = TRUE;
    
END $$;

----------------
-- STEP 2: Profiles Table RLS Policies
----------------

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing profile policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can access all profiles" ON public.profiles;

-- Create comprehensive policies for the profiles table
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

-- Service role can access all profiles
CREATE POLICY "Service role can access all profiles" 
ON public.profiles 
USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'service_role'));

----------------
-- STEP 3: Travel Preferences Table RLS Policies
----------------

-- Enable RLS for travel_preferences
ALTER TABLE public.travel_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read their own travel preferences" ON public.travel_preferences;
DROP POLICY IF EXISTS "Users can update their own travel preferences" ON public.travel_preferences;
DROP POLICY IF EXISTS "Users can delete their own travel preferences" ON public.travel_preferences;
DROP POLICY IF EXISTS "Users can insert their own travel preferences" ON public.travel_preferences;
DROP POLICY IF EXISTS "Users can manage their own travel preferences" ON public.travel_preferences;
DROP POLICY IF EXISTS "Service role can access all travel preferences" ON public.travel_preferences;

-- Create comprehensive RLS policies for travel_preferences
-- This adds the critical INSERT policy that was likely missing
CREATE POLICY "Users can read their own travel preferences" 
  ON public.travel_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own travel preferences" 
  ON public.travel_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own travel preferences" 
  ON public.travel_preferences FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own travel preferences" 
  ON public.travel_preferences FOR DELETE 
  USING (auth.uid() = user_id);

-- Service role can access all travel preferences
CREATE POLICY "Service role can access all travel preferences" 
  ON public.travel_preferences 
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'service_role'));

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'RLS policies and database schema have been successfully updated.';
END $$;
