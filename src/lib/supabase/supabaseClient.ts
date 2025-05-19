/**
 * Supabase Client Configuration
 * 
 * This module configures and exports the Supabase client for the application.
 * Following Planora's architectural principles with proper separation of concerns.
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

/**
 * Get the site URL for authentication redirects
 * CRITICAL: Production URL must match exactly with what's registered in Google OAuth
 */
const getSiteUrl = (): string => {
  // In production, use the deployed URL
  if (import.meta.env.PROD) {
    return 'https://planora-ai-beta.vercel.app';
  }
  
  // In development, use the local origin
  return window.location.origin || 'http://localhost:5173';
};

// Create Supabase client with the correct auth configuration for Google OAuth
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'supabase-auth-token',
    storage: window.localStorage,
    // Ensure we get debug info when auth fails
    debug: import.meta.env.DEV
  },
  global: {
    headers: {
      'x-application-name': 'planora.ai'
    },
    // Log API requests in development for debugging
    fetch: (url, options) => {
      if (import.meta.env.DEV) {
        console.log('⚙️ Supabase Request:', url);
      }
      
      return fetch(url, options).then(response => {
        if (import.meta.env.DEV) {
          // Clone the response so we can inspect it
          const clone = response.clone();
          
          clone.text().then(text => {
            try {
              const data = JSON.parse(text);
              console.log('📊 Supabase Response:', {
                url: response.url,
                status: response.status,
                data
              });
            } catch (e) {
              // Not valid JSON, just log the text
              console.log('📄 Supabase Response:', {
                url: response.url,
                status: response.status,
                text: text.length > 500 ? text.substring(0, 500) + '...' : text
              });
            }
          }).catch(err => {
            console.error('❌ Supabase Response Error:', {
              url: response.url,
              status: response.status,
              error: err instanceof Error ? err.message : String(err)
            });
          });
        }
        
        return response;
      });
    }
  }
});
