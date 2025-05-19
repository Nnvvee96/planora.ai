/**
 * Authentication Callback Component
 * 
 * TEMPORARY MOCK VERSION - Non-functional placeholder
 * Following Planora's architectural principles with proper type safety and separation of concerns
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Mock Auth Callback Component
 * Simply redirects to onboarding
 */
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Log for debugging
    console.log('MOCK AUTH: Callback component mounted');
    
    // In mock mode, simply redirect to onboarding after a short delay
    setTimeout(() => {
      navigate('/onboarding', { replace: true });
    }, 1000);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4 bg-planora-purple-dark">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-planora-accent-purple border-t-transparent"></div>
        <h2 className="mt-6 text-xl font-semibold text-white">Authenticating...</h2>
        <p className="mt-2 text-sm text-white/70">
          (Mock Mode: Will redirect to onboarding automatically)
        </p>
      </div>
    </div>
  );
};

export { AuthCallback };
