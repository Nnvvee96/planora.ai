-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.profiles;
CREATE POLICY "Allow users to view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
CREATE POLICY "Allow users to update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Allow admins to access all profiles
DROP POLICY IF EXISTS "Allow admins to access all profiles" ON public.profiles;
CREATE POLICY "Allow admins to access all profiles"
ON public.profiles
FOR ALL
USING (
  (get_my_claim('user_role'::text) = '"admin"'::jsonb)
);
