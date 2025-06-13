-- Planora.ai Subscriptions Schema
-- Version: 1.0
-- Last Updated: CURRENT_DATE
-- Description: Defines tables for managing subscription products and user subscriptions.

-------------------------
-- 1. Create a `products` table
-- Stores information about the subscription plans we offer.
-------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY, -- The product ID from Stripe (e.g., prod_123)
  active BOOLEAN,
  name TEXT,
  description TEXT,
  image TEXT,
  metadata JSONB
);
COMMENT ON TABLE public.products IS 'Stores product information from Stripe.';

-------------------------
-- 2. Create a `prices` table
-- Stores price information for each product. A product can have multiple prices.
-------------------------
CREATE TABLE IF NOT EXISTS public.prices (
  id TEXT PRIMARY KEY, -- The price ID from Stripe (e.g., price_123)
  product_id TEXT REFERENCES public.products(id),
  active BOOLEAN,
  description TEXT,
  unit_amount BIGINT,
  currency TEXT,
  type TEXT,
  interval TEXT,
  interval_count INTEGER,
  trial_period_days INTEGER,
  metadata JSONB,
  CONSTRAINT check_currency_length CHECK (char_length(currency) = 3)
);
COMMENT ON TABLE public.prices IS 'Stores price information for products from Stripe.';
CREATE INDEX IF NOT EXISTS prices_product_id_idx ON public.prices(product_id);

-------------------------
-- 3. Create a `subscriptions` table
-- Stores user subscription status.
-------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id TEXT PRIMARY KEY, -- The subscription ID from Stripe (e.g., sub_123)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT, -- Stripe subscription status (e.g., active, past_due, canceled)
  price_id TEXT REFERENCES public.prices(id),
  quantity INTEGER,
  cancel_at_period_end BOOLEAN,
  created TIMESTAMPTZ NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  metadata JSONB
);
COMMENT ON TABLE public.subscriptions IS 'Stores user subscription information from Stripe.';
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);

-- Enable RLS for all new tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for `products` and `prices`
-- Allow any authenticated user to read product and price information.
CREATE POLICY "Allow public read-only access" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access" ON public.prices FOR SELECT USING (true);

-- Policies for `subscriptions`
-- 1. Users can view their own subscription.
CREATE POLICY "Can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id); 