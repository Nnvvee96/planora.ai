-- Planora.ai Authentication System Simplification
-- Version: 2.0
-- Last Updated: 2025-01-28
-- Description: Simplifies auth system, removes verification codes, implements subscription-based roles

-- 1. Drop verification code system (no longer needed)
DROP TABLE IF EXISTS public.verification_codes CASCADE;

-- 2. Simplify roles to subscription-based only
DELETE FROM public.user_roles WHERE role_id IN (
  SELECT id FROM public.roles WHERE name IN ('admin', 'editor', 'beta_tester', 'service_account')
);

DELETE FROM public.roles WHERE name IN ('admin', 'editor', 'beta_tester', 'service_account');

-- 3. Update roles to subscription-based system
INSERT INTO public.roles (name, description) VALUES
  ('free', 'Free tier user with basic features')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO public.roles (name, description) VALUES
  ('tier1', 'Explorer tier - $9.99/month with enhanced features')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO public.roles (name, description) VALUES
  ('tier2', 'Wanderer Pro tier - $19.99/month with premium features')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- 4. Remove beta tester column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_beta_tester;

-- 5. Add subscription tier tracking to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD CONSTRAINT check_subscription_tier 
  CHECK (subscription_tier IN ('free', 'tier1', 'tier2'));

-- 6. Create function to get user subscription tier
CREATE OR REPLACE FUNCTION public.get_user_subscription_tier(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  tier TEXT;
BEGIN
  -- First check active subscription
  SELECT 
    CASE 
      WHEN p.name = 'Explorer' THEN 'tier1'
      WHEN p.name = 'Wanderer Pro' THEN 'tier2'
      WHEN p.name = 'Global Elite' THEN 'tier2' -- Map to tier2 for now
      ELSE 'free'
    END INTO tier
  FROM public.subscriptions s
  JOIN public.prices pr ON s.price_id = pr.id
  JOIN public.products p ON pr.product_id = p.id
  WHERE s.user_id = p_user_id 
    AND s.status IN ('active', 'trialing')
  ORDER BY s.current_period_end DESC
  LIMIT 1;
  
  -- Fallback to profile tier or free
  IF tier IS NULL THEN
    SELECT subscription_tier INTO tier
    FROM public.profiles
    WHERE id = p_user_id;
  END IF;
  
  RETURN COALESCE(tier, 'free');
END;
$$;

-- 7. Create function to assign user role based on subscription
CREATE OR REPLACE FUNCTION public.assign_user_subscription_role(p_user_id UUID, p_tier TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  role_id UUID;
BEGIN
  -- Validate tier
  IF p_tier NOT IN ('free', 'tier1', 'tier2') THEN
    RETURN FALSE;
  END IF;
  
  -- Get role ID
  SELECT id INTO role_id FROM public.roles WHERE name = p_tier;
  
  IF role_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Remove existing role assignments
  DELETE FROM public.user_roles WHERE user_id = p_user_id;
  
  -- Assign new role
  INSERT INTO public.user_roles (user_id, role_id) VALUES (p_user_id, role_id);
  
  -- Update profile tier
  UPDATE public.profiles SET subscription_tier = p_tier WHERE id = p_user_id;
  
  RETURN TRUE;
END;
$$;

-- 8. Create trigger to assign free tier to new users
CREATE OR REPLACE FUNCTION public.assign_default_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  free_role_id UUID;
BEGIN
  -- Get free role ID
  SELECT id INTO free_role_id FROM public.roles WHERE name = 'free';
  
  -- Assign free role to new user
  INSERT INTO public.user_roles (user_id, role_id) VALUES (NEW.id, free_role_id);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new profile creation
DROP TRIGGER IF EXISTS assign_default_role_trigger ON public.profiles;
CREATE TRIGGER assign_default_role_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_user_role();

-- 9. Update RLS policies to use subscription tiers
DROP POLICY IF EXISTS "Admins can select any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;
DROP POLICY IF EXISTS "Editors can select any profile" ON public.profiles;

-- 10. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_subscription_tier(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.assign_user_subscription_role(UUID, TEXT) TO authenticated, service_role;

-- 11. Migrate existing users to free tier
UPDATE public.profiles SET subscription_tier = 'free' WHERE subscription_tier IS NULL;

-- Assign free role to existing users who don't have a role
INSERT INTO public.user_roles (user_id, role_id)
SELECT p.id, r.id
FROM public.profiles p
CROSS JOIN public.roles r
WHERE r.name = 'free'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id
  );

COMMENT ON FUNCTION public.get_user_subscription_tier(UUID) IS 'Returns the current subscription tier for a user based on active subscription or profile setting.';
COMMENT ON FUNCTION public.assign_user_subscription_role(UUID, TEXT) IS 'Assigns a subscription-based role to a user and updates their profile tier.';
