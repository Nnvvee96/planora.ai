/**
 * Subscription Types
 * 
 * Type definitions for the subscriptions feature.
 */

// Mirrors the public.products table
export interface Product {
  id: string;
  active: boolean;
  name: string;
  description: string | null;
  image: string | null;
  metadata: Record<string, unknown> | null;
}

// Mirrors the public.prices table
export interface Price {
  id: string;
  product_id: string;
  active: boolean;
  description: string | null;
  unit_amount: number | null;
  currency: string | null;
  type: string;
  interval: string | null;
  interval_count: number | null;
  trial_period_days: number | null;
  metadata: Record<string, unknown> | null;
}

// Represents a product with its associated prices
export interface ProductWithPrices {
  product: Product;
  prices: Price[];
}

// Mirrors the public.subscriptions table
export interface Subscription {
  id: string;
  user_id: string;
  status: string;
  price_id: string;
  quantity: number | null;
  cancel_at_period_end: boolean;
  created: string;
  current_period_start: string;
  current_period_end: string;
  ended_at: string | null;
  cancel_at: string | null;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  metadata: Record<string, unknown> | null;
} 