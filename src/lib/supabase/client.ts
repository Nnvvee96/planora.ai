/**
 * Supabase Client Configuration
 *
 * Simple, production-ready Supabase client configuration.
 * Following standard patterns that work well with modern bundlers.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Environment variables with proper validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file.\n" +
      `VITE_SUPABASE_URL: ${supabaseUrl ? "✓" : "✗"}\n` +
      `VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? "✓" : "✗"}`,
  );
}

// Create and export the Supabase client
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
    global: {
      headers: {
        "x-application-name": "planora-web-app",
      },
    },
  },
);

// Remove default export to comply with architecture rules

// Export types for use in other files
export type { SupabaseClient } from "@supabase/supabase-js";
