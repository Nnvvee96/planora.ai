/**
 * Database API
 * 
 * Public API for database-related functionality.
 * Following Planora's architectural principles with feature-first organization and named exports.
 * 
 * Database Components:
 * - Client: Supabase client configuration
 * - Schema: Database tables, RLS policies, and setup scripts
 * - Functions: Edge Functions for database-related operations
 *   - scheduled-account-purge: Automated purging of user accounts past recovery period
 */

// Import client
import { supabase, supabaseClient } from './client/supabaseClient';

// Re-export with consistent naming pattern
export { supabase, supabaseClient };
