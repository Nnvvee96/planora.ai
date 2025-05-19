/**
 * Supabase Client Configuration
 * 
 * CRITICAL FIX: This is a simplified, properly configured Supabase client
 * that follows exactly what's recommended in the Supabase documentation.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabaseTypes';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// CRITICAL: Create client with minimal configuration
// Avoid overriding default Supabase behavior
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
