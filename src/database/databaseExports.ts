/**
 * Database Exports
 * 
 * Central export file for database-related functionality.
 * Follows Planora's architectural principle of named exports only.
 */

// Re-export the Supabase client
import { supabase, supabaseClient } from './client/supabaseClient';

export { supabase, supabaseClient };
