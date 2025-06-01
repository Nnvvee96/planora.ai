/**
 * Debug Screen Component
 * 
 * A special component for diagnosing issues with authentication and environment.
 * Following Planora's architectural principles with feature-first organization.
 */

import React, { useEffect, useState } from 'react';
import { Button } from '@/ui/atoms/Button';
import { getAuthService } from '@/features/auth/authApi';
import { userProfileService } from '@/features/user-profile/userProfileApi';

/**
 * Debug screen component for diagnosing production issues
 * Shows environment, Supabase connection, and authentication status
 */
export const DebugScreen: React.FC = () => {
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking...');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Collect environment variables (safely)
    const env = {
      'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL || 'Not set',
      'VITE_ENABLE_GOOGLE_AUTH': String(import.meta.env.VITE_ENABLE_GOOGLE_AUTH) || 'Not set',
      'NODE_ENV': import.meta.env.MODE || 'Not set',
      'BASE_URL': import.meta.env.BASE_URL || 'Not set',
    };
    setEnvVars(env);
    
    // Extract Supabase URL (but don't show the full key)
    if (import.meta.env.VITE_SUPABASE_URL) {
      setSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
    } else {
      setSupabaseUrl('Not found in environment variables');
    }
    
    // Check Supabase connection
    const checkConnection = async () => {
      try {
        // Use user profile service to check for profiles count
        const connected = await userProfileService.checkDatabaseConnection();
        
        if (connected) {
          setConnectionStatus('Connected');
          setErrorDetails(null);
        } else {
          setConnectionStatus('Connection Error');
          setErrorDetails('Could not connect to database');
        }
      } catch (err) {
        setConnectionStatus('Fatal Error');
        setErrorDetails(err instanceof Error ? err.message : 'Unknown error');
      }
    };
    
    checkConnection();
  }, []);
  
  // Handle test auth click
  const handleTestAuth = async () => {
    try {
      // Use auth service through proper API boundary
      const authService = getAuthService();
      const { session, error } = await authService.refreshSession();
      console.log('Auth session test:', session);
      alert(`Auth session test: ${error ? 'Error: ' + error.message : 'Success - check console for details'}`);
    } catch (err) {
      console.error('Auth test error:', err);
      alert('Auth test error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Planora Debug Screen</h1>
      
      <div className="grid gap-6">
        <section className="p-4 bg-slate-50 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Environment Variables</h2>
          <ul className="space-y-2">
            {Object.entries(envVars).map(([key, value]) => (
              <li key={key} className="flex justify-between">
                <span className="font-mono">{key}:</span> 
                <span className="font-mono">{value === 'Not set' ? 
                  <span className="text-red-500">Not set</span> : 
                  (key.includes('KEY') ? '****' : value)
                }</span>
              </li>
            ))}
          </ul>
        </section>
        
        <section className="p-4 bg-slate-50 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Supabase Connection</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Supabase URL:</span>
              <span className="font-mono">{supabaseUrl}</span>
            </div>
            <div className="flex justify-between">
              <span>Connection Status:</span>
              <span className={`font-medium ${
                connectionStatus === 'Connected' ? 'text-green-600' : 
                connectionStatus === 'Checking...' ? 'text-blue-600' : 'text-red-600'
              }`}>{connectionStatus}</span>
            </div>
            {errorDetails && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                <strong>Error:</strong> {errorDetails}
              </div>
            )}
          </div>
        </section>
        
        <section className="p-4 bg-slate-50 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Authentication Tests</h2>
          <div className="space-y-4">
            <Button onClick={handleTestAuth} variant="outline" className="w-full">
              Test Auth Session
            </Button>
            <a href="/login" className="block mt-2">
              <Button variant="default" className="w-full">
                Go to Login Page
              </Button>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};
