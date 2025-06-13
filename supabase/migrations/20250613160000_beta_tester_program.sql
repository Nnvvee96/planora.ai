-- Consolidated migration for the Beta Tester Program feature

-- 1. Add the is_beta_tester flag to the profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN DEFAULT FALSE NOT NULL;

-- 2. Create the helper function to get a claim from the JWT
CREATE OR REPLACE FUNCTION get_my_claim(claim TEXT)
RETURNS JSONB AS $$
  SELECT COALESCE(NULLIF(current_setting('request.jwt.claims', true), '')::JSONB ->> claim, NULL)::JSONB
$$ LANGUAGE SQL STABLE;

-- 3. Apply RLS policies related to the program
-- Ensure RLS is enabled on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile (general policy, good to have here)
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.profiles;
CREATE POLICY "Allow users to view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile (general policy, good to have here)
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
CREATE POLICY "Allow users to update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Allow admins to access all profiles (this relies on the get_my_claim function)
DROP POLICY IF EXISTS "Allow admins to access all profiles" ON public.profiles;
CREATE POLICY "Allow admins to access all profiles"
ON public.profiles
FOR ALL
USING (
  (get_my_claim('user_role'::text) = '"admin"'::jsonb)
); 