/**
 * Auth Callback Component
 * 
 * Component to handle OAuth callback.
 * Following Planora's architectural principles with feature-first organization.
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

/**
 * Component that handles OAuth callback
 * Displays a loading state while processing the auth callback
 */
export const AuthCallback: React.FC = () => {
  const { handleAuthCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(true);
  
  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('Auth callback component mounted, processing...');
        setIsProcessing(true);
        
        // Gather debug info
        const envInfo = {
          isProd: import.meta.env.PROD,
          isDev: import.meta.env.DEV,
          mode: import.meta.env.MODE,
          hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
          hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          url: window.location.href,
          hash: window.location.hash,
          search: window.location.search,
        };
        setDebugInfo(envInfo);
        console.log('Auth env debug:', envInfo);
        
        await handleAuthCallback();
        setIsProcessing(false);
      } catch (err) {
        console.error('Error processing auth callback:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setIsProcessing(false);
      }
    };
    
    processCallback();
  }, [handleAuthCallback]);
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="p-8 rounded-lg bg-red-50 border border-red-200 max-w-2xl w-full">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Authentication Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          
          <div className="my-4 p-4 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-60">
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
          
          <div className="flex gap-3 mt-6">
            <a href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md">
              Return to Home
            </a>
            <a href="/debug" className="inline-block px-4 py-2 bg-purple-600 text-white rounded-md">
              Go to Debug Screen
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="p-8 rounded-lg bg-white border shadow-md max-w-md w-full text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
        <p className="mt-4 text-lg font-medium">{isProcessing ? 'Processing authentication...' : 'Redirecting...'}</p>
        <p className="text-sm text-gray-500 mt-2">You will be redirected automatically.</p>
      </div>
    </div>
  );
};
