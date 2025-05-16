/**
 * Type definitions for Supabase Auth integration
 * These types help eliminate 'any' usage and improve type safety
 */

export interface SupabaseIdentity {
  id: string;
  provider: string;
  identity_data?: {
    email?: string;
    sub?: string;
    given_name?: string;
    family_name?: string;
    name?: string;
    picture?: string;
  };
  created_at?: string;
  last_sign_in_at?: string;
  updated_at?: string;
}

export interface SupabaseUserMetadata {
  username?: string;
  first_name?: string;
  last_name?: string;
  has_completed_onboarding?: boolean;
  city?: string;
  country?: string;
  birthdate?: string;
  [key: string]: unknown;
}

export interface SupabaseUser {
  id: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: SupabaseUserMetadata;
  aud?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  role?: string;
  updated_at?: string;
  identities?: SupabaseIdentity[];
}
