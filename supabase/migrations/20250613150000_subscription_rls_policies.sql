-- Planora.ai Subscription RLS Policies
-- Version: 1.0
-- Last Updated: CURRENT_DATE
-- Description: Adds RLS policies to restrict access to features based on subscription status.

-------------------------
-- 1. Helper Function to check subscription status
-- Checks if a user has an active subscription.
-------------------------
CREATE OR REPLACE FUNCTION public.get_user_subscription_status(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  sub_status TEXT;
BEGIN
  SELECT status INTO sub_status
  FROM public.subscriptions
  WHERE user_id = p_user_id
  ORDER BY current_period_end DESC
  LIMIT 1;
  
  RETURN COALESCE(sub_status, 'free');
END;
$$;
COMMENT ON FUNCTION public.get_user_subscription_status(UUID) IS 'Returns the current subscription status for a user.';

GRANT EXECUTE ON FUNCTION public.get_user_subscription_status(UUID) TO authenticated, service_role;

-----------------------------------------------------
-- 2. Apply RLS to a hypothetical premium feature table
-- This is an example of how you would protect a table.
-- You would apply a similar policy to any feature-specific tables
-- that require a paid subscription.
-----------------------------------------------------

-- First, let's create a dummy table for demonstration
CREATE TABLE IF NOT EXISTS public.premium_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.premium_features ENABLE ROW LEVEL SECURITY;

-- Policy: Allow access only to users with an 'active' or 'trialing' subscription.
CREATE POLICY "Allow access for active subscribers" ON public.premium_features
  FOR ALL
  TO authenticated
  USING (
    (public.get_user_subscription_status(auth.uid()) IN ('active', 'trialing'))
  )
  WITH CHECK (
    (public.get_user_subscription_status(auth.uid()) IN ('active', 'trialing'))
  );

COMMENT ON TABLE public.premium_features IS 'Example table for a premium feature, protected by subscription-based RLS.'; 