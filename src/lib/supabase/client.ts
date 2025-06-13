import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 *
 * Provides a configured Supabase client instance for frontend authentication operations.
 * Following Planora's architectural principles with feature-first organization.
 */

// Get environment variables from Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * The configured Supabase client instance for frontend authentication.
 * This client is configured with the anonymous key for public access.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 