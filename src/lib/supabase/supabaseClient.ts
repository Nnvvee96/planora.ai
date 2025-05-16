/**
 * Supabase Client Configuration
 * 
 * This module configures and exports the Supabase client for the application.
 * In development, it gracefully handles missing credentials to prevent crashes.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabaseTypes';

// Development fallback values (these won't work for actual API calls)
const DEV_FALLBACK_URL = 'https://placeholder-project.supabase.co';
const DEV_FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.J2Pcv2eV-RdGZ0zpCcGnF8-TxiIlrP9FfFUKH8siDvA';

// Get environment variables or use fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEV_FALLBACK_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEV_FALLBACK_KEY;

// Warn if credentials are missing in non-production environments
if ((!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) && import.meta.env.MODE !== 'production') {
  console.warn(
    '%c⚠️ Supabase Credentials Missing', 
    'background: #FFC107; color: #000; padding: 2px 4px; border-radius: 2px; font-weight: bold;',
    '\nPlease set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.\n' +
    'Using placeholder values for development. API calls will fail until proper credentials are set.'
  );
}

// Initialize Supabase client with debug logging
/**
 * Get the site URL for authentication redirects
 * This function returns the appropriate URL based on the current environment
 */
const getSiteUrl = (): string => {
  // In production environment, use the deployed URL
  if (import.meta.env.PROD) return 'https://planora.vercel.app';
  
  // In development, use the current origin or localhost
  return window.location.origin || 'http://localhost:5173';
};

// Create the Supabase client with proper typings for the auth options
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    // @ts-expect-error - redirectTo is supported in newer Supabase versions but TypeScript definitions aren't updated
    redirectTo: `${getSiteUrl()}/auth/callback`,
  },
  global: {
    // Add request logging to debug API calls
    fetch: (url, options) => {
      console.log('Supabase API Request:', url);
      return fetch(url, options).then(response => {
        // Clone the response so we can inspect it without consuming it
        const clone = response.clone();
        clone.text().then(text => {
          try {
            // Try to parse as JSON to see structured response
            const data = JSON.parse(text);
            console.log('Supabase API Response:', {
              url: response.url,
              status: response.status,
              data,
            });
          } catch (e) {
            // If not valid JSON, just log the text
            console.log('Supabase API Response:', {
              url: response.url,
              status: response.status,
              text: text.substring(0, 500) + (text.length > 500 ? '...' : ''),
            });
          }
        }).catch(err => {
          console.log('Supabase API Response Error:', {
            url: response.url,
            status: response.status,
            error: err.message,
          });
        });
        return response;
      });
    },
  },
});
