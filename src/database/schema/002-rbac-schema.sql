-- Planora.ai RBAC Schema
-- Version: 1.0
-- Last Updated: 2025-06-09
-- Description: Defines tables and functions for Role-Based Access Control.

-- Roles Table
-- Stores the different roles available in the system.
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL, -- e.g., 'admin', 'editor', 'user', 'beta_tester', 'service_account'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
COMMENT ON TABLE public.roles IS 'Defines the roles available in the system (e.g., admin, user).';
COMMENT ON COLUMN public.roles.name IS 'Unique name of the role.';

-- User Roles Table (Junction Table)
-- Links users to their assigned roles.
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (user_id, role_id) -- Ensures a user has a role only once
);
COMMENT ON TABLE public.user_roles IS 'Junction table linking users to their roles.';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);

-- Trigger to update 'updated_at' on roles table
CREATE OR REPLACE FUNCTION public.update_roles_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS before_roles_update ON public.roles;
CREATE TRIGGER before_roles_update
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_roles_updated_at_column();

-- Seed initial roles
-- This ensures basic roles are present. Adjust as needed.
INSERT INTO public.roles (name, description) VALUES
  ('admin', 'Administrator with full system access.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.roles (name, description) VALUES
  ('editor', 'Editor with content management capabilities.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.roles (name, description) VALUES
  ('user', 'Standard user with access to core features.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.roles (name, description) VALUES
  ('beta_tester', 'User with access to beta features.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.roles (name, description) VALUES
  ('service_account', 'Non-human account for automated system tasks.')
ON CONFLICT (name) DO NOTHING;


-- RBAC Helper Functions --

-- Function to get all roles for a given user
CREATE OR REPLACE FUNCTION public.get_user_roles(p_user_id UUID)
RETURNS TEXT[]
LANGUAGE plpgsql
STABLE -- Indicates the function cannot modify the database and always produces the same result for the same arguments within a single transaction.
SECURITY DEFINER SET search_path = public -- Important for RLS bypass within the function if needed for complex role inheritance logic in future, for now, direct joins are fine.
AS $$
BEGIN
  RETURN ARRAY(
    SELECT r.name
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id
  );
END;
$$;
COMMENT ON FUNCTION public.get_user_roles(UUID) IS 'Returns an array of role names for a given user ID.';

-- Function to check if a user has a specific role
CREATE OR REPLACE FUNCTION public.is_user_in_role(p_user_id UUID, p_role_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id AND r.name = p_role_name
  );
END;
$$;
COMMENT ON FUNCTION public.is_user_in_role(UUID, TEXT) IS 'Checks if a user has a specific role. Returns true or false.';


-- RLS Policies for RBAC tables --

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS for 'roles' table
-- Authenticated users can view all available roles.
CREATE POLICY "Authenticated users can view roles" ON public.roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service_role (or a future admin role with specific grants) can manage roles.
CREATE POLICY "Service account can manage roles" ON public.roles
  FOR ALL -- Covers INSERT, UPDATE, DELETE
  USING (auth.role() = 'service_role') -- For SELECT, UPDATE, DELETE conditions
  WITH CHECK (auth.role() = 'service_role'); -- For INSERT, UPDATE conditions

-- RLS for 'user_roles' table
-- Users can view their own role assignments (implicitly through get_user_roles).
CREATE POLICY "Users can view their own role assignments" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id); 

-- Only service_role (or a future admin role) can manage role assignments.
CREATE POLICY "Service account can manage user role assignments" ON public.user_roles
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Grant USAGE on schema and necessary permissions for the new functions and tables
GRANT EXECUTE ON FUNCTION public.get_user_roles(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_user_in_role(UUID, TEXT) TO authenticated, service_role;

-- Grant permissions to supabase_auth_admin (used by Edge Functions with service_role key)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roles TO supabase_auth_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO supabase_auth_admin;

-- Grant permissions for general authenticated users (RLS will still apply)
GRANT SELECT ON public.roles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated; 

