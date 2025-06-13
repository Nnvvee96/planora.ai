-- Planora.ai RLS Policies for Admins and Editors
-- Version: 1.0
-- Last Updated: CURRENT_DATE
-- Description: Applies fine-grained RLS policies to core tables,
-- granting appropriate permissions to 'admin' and 'editor' roles.

-- Enable RLS on core tables if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_preferences ENABLE ROW LEVEL SECURITY;

---------------------------------
-- Policies for 'profiles' table
---------------------------------

-- 1. Users can select their own profile
DROP POLICY IF EXISTS "Users can select their own profile" ON public.profiles;
CREATE POLICY "Users can select their own profile" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 2. Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Admins can select any profile
DROP POLICY IF EXISTS "Admins can select any profile" ON public.profiles;
CREATE POLICY "Admins can select any profile" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_user_in_role(auth.uid(), 'admin'));

-- 4. Admins can update any profile
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_user_in_role(auth.uid(), 'admin'))
  WITH CHECK (public.is_user_in_role(auth.uid(), 'admin'));

-- 5. Admins can delete any profile (which cascades to auth.users)
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;
CREATE POLICY "Admins can delete any profile" ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.is_user_in_role(auth.uid(), 'admin'));
  
-- 6. Editors can select any profile
DROP POLICY IF EXISTS "Editors can select any profile" ON public.profiles;
CREATE POLICY "Editors can select any profile" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_user_in_role(auth.uid(), 'editor'));

-------------------------------------------
-- Policies for 'travel_preferences' table
-------------------------------------------

-- 1. Users can select their own travel preferences
DROP POLICY IF EXISTS "Users can select their own travel preferences" ON public.travel_preferences;
CREATE POLICY "Users can select their own travel preferences" ON public.travel_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Users can manage (insert/update/delete) their own travel preferences
DROP POLICY IF EXISTS "Users can manage their own travel preferences" ON public.travel_preferences;
CREATE POLICY "Users can manage their own travel preferences" ON public.travel_preferences
  FOR ALL -- Covers INSERT, UPDATE, DELETE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Admins can manage any travel preferences
DROP POLICY IF EXISTS "Admins can manage any travel preferences" ON public.travel_preferences;
CREATE POLICY "Admins can manage any travel preferences" ON public.travel_preferences
  FOR ALL
  TO authenticated
  USING (public.is_user_in_role(auth.uid(), 'admin'))
  WITH CHECK (public.is_user_in_role(auth.uid(), 'admin')); 