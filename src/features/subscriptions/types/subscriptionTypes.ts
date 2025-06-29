/**
 * Subscription Types
 *
 * Type definitions for the subscriptions feature.
 */

// Subscription tier types matching database schema
export type SubscriptionTier = 'free' | 'explorer' | 'wanderer_pro' | 'global_elite';

// Human-readable tier names
export const SUBSCRIPTION_TIER_NAMES: Record<SubscriptionTier, string> = {
  free: 'Free',
  explorer: 'Explorer',
  wanderer_pro: 'Wanderer Pro',
  global_elite: 'Global Elite'
};

// Tier feature access levels
export interface TierFeatures {
  maxTripsPerMonth: number;
  maxDestinationsPerTrip: number;
  advancedFilters: boolean;
  prioritySupport: boolean;
  customItineraries: boolean;
  offlineAccess: boolean;
}

export const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  free: {
    maxTripsPerMonth: 3,
    maxDestinationsPerTrip: 3,
    advancedFilters: false,
    prioritySupport: false,
    customItineraries: false,
    offlineAccess: false
  },
  explorer: {
    maxTripsPerMonth: 10,
    maxDestinationsPerTrip: 5,
    advancedFilters: true,
    prioritySupport: false,
    customItineraries: true,
    offlineAccess: false
  },
  wanderer_pro: {
    maxTripsPerMonth: 25,
    maxDestinationsPerTrip: 10,
    advancedFilters: true,
    prioritySupport: true,
    customItineraries: true,
    offlineAccess: true
  },
  global_elite: {
    maxTripsPerMonth: -1, // Unlimited
    maxDestinationsPerTrip: -1, // Unlimited
    advancedFilters: true,
    prioritySupport: true,
    customItineraries: true,
    offlineAccess: true
  }
};

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
