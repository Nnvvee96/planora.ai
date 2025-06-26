import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 *
 * Provides a configured Supabase client instance for frontend authentication operations.
 * Following Planora's architectural principles with feature-first organization.
 */

// Defensive environment variable access to prevent TDZ errors
let supabaseUrl: string;
let supabaseAnonKey: string;

try {
  // Get environment variables from Vite with fallbacks
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
} catch (error) {
  console.error('Error accessing environment variables:', error);
  supabaseUrl = '';
  supabaseAnonKey = '';
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

/**
 * The configured Supabase client instance for frontend authentication.
 * This client is configured with the anonymous key for public access.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}); 