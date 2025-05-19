/**
 * Supabase Client Configuration
 * 
 * Creates and exports a configured Supabase client instance
 * for use throughout the application.
 */

import { createClient } from '@supabase/supabase-js';

// These environment variables are injected by Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate environment variables are present
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check .env.local file.');
}

// Create a single Supabase client for interaction with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
