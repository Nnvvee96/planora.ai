-- Add missing custom_date_flexibility column to travel_preferences table
ALTER TABLE public.travel_preferences 
ADD COLUMN IF NOT EXISTS custom_date_flexibility TEXT DEFAULT '';

-- Remove unused columns from travel_preferences table
-- Comment these out if you need the fields for future functionalities
-- ALTER TABLE public.travel_preferences DROP COLUMN IF EXISTS destinations;
-- ALTER TABLE public.travel_preferences DROP COLUMN IF EXISTS preferred_activities;
-- ALTER TABLE public.travel_preferences DROP COLUMN IF EXISTS travel_style;

-- Create index on user_id for better query performance
CREATE INDEX IF NOT EXISTS travel_preferences_user_id_idx ON public.travel_preferences(user_id);
CREATE INDEX IF NOT EXISTS profiles_id_idx ON public.profiles(id);

-- Update RLS policies to ensure proper access
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for the profiles table
CREATE POLICY IF NOT EXISTS "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create policies for travel_preferences table
CREATE POLICY IF NOT EXISTS "Users can view their own travel preferences" 
ON public.travel_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own travel preferences" 
ON public.travel_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own travel preferences" 
ON public.travel_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own travel preferences" 
ON public.travel_preferences 
FOR DELETE 
USING (auth.uid() = user_id);
