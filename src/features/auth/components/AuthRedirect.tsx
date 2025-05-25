/**
 * Auth Redirect Animation Component
 * 
 * Provides a smooth loading animation during authentication redirects.
 * Following Planora's architectural principles with feature-first organization.
 */

import React, { useEffect, useState } from 'react';
import { Logo } from '@/ui/atoms/Logo';

interface AuthRedirectProps {
  message?: string;
  redirectTo?: string;
  delay?: number; // Delay in milliseconds before redirecting
}

export const AuthRedirect: React.FC<AuthRedirectProps> = ({ 
  message = "Signing you in...", 
  redirectTo,
  delay = 1500 // Default 1.5 seconds
}) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (redirectTo) {
      // Start progress animation
      const startTime = Date.now();
      const endTime = startTime + delay;
      
      const progressInterval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTime;
        const newProgress = Math.min(100, (elapsed / delay) * 100);
        
        setProgress(newProgress);
        
        if (now >= endTime) {
          clearInterval(progressInterval);
          window.location.href = redirectTo;
        }
      }, 16); // ~60fps
      
      return () => clearInterval(progressInterval);
    }
  }, [redirectTo, delay]);
  
  return (
    <div className="min-h-screen bg-planora-purple-dark flex flex-col items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-planora-purple-dark via-planora-purple-dark to-black opacity-90 z-0"></div>
      
      {/* Subtle gradient accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-planora-accent-purple/5 blur-3xl"></div>
        <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-planora-accent-blue/5 blur-3xl"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
        {/* Logo with pulsing animation */}
        <div className="animate-pulse">
          <Logo size="lg" />
        </div>
        
        {/* Loading animation */}
        <div className="relative w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink rounded-full"
            style={{ width: `${progress}%`, transition: 'width 0.3s ease-out' }}
          ></div>
        </div>
        
        {/* Animated plane icon */}
        <div className="relative w-full h-20">
          <div 
            className="absolute top-1/2 transform -translate-y-1/2"
            style={{ 
              left: `${progress}%`, 
              transform: `translateX(-50%) translateY(-50%)`,
              transition: 'left 0.3s ease-out'
            }}
          >
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
              className="text-white animate-bounce"
            >
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              <path d="M14.05 2a9 9 0 015.71 5.71" />
              <path d="M14.05 6a5 5 0 013.16 3.16" />
            </svg>
          </div>
        </div>
        
        {/* Message */}
        <p className="text-white/80 text-lg font-medium">{message}</p>
      </div>
    </div>
  );
};
