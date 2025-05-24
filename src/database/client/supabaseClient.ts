/**
 * Supabase Client Configuration
 * 
 * Creates and exports a configured Supabase client instance
 * for use throughout the application.
 * 
 * Following Planora's architectural principles with proper named exports
 * and separation of concerns.
 */

import { createClient } from '@supabase/supabase-js';

// These environment variables are injected by Vite
// @ts-ignore - Allow access to environment variables without type errors
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// @ts-ignore - Allow access to environment variables without type errors
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate environment variables are present
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check .env file.');
}

// Create a single Supabase client for interaction with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Named export for the client to follow architectural principles
export { supabase as supabaseClient };
