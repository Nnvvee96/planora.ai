/**
 * Auth Redirect Animation Component
 *
 * Provides a smooth loading animation during authentication redirects.
 * Following Planora's architectural principles with feature-first organization.
 */

import React, { useEffect, useState } from "react";
import { Logo } from "@/ui/atoms/Logo";

interface AuthRedirectProps {
  message?: string;
  redirectTo?: string;
  delay?: number; // Delay in milliseconds before redirecting
}

export const AuthRedirect = ({
  message = "Signing you in...",
  redirectTo,
  delay = 1500, // Default 1.5 seconds
}: AuthRedirectProps) => {
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
            style={{ width: `${progress}%`, transition: "width 0.3s ease-out" }}
          ></div>
        </div>

        {/* Animated plane icon */}
        <div className="relative w-full h-20">
          <div
            className="absolute top-1/2 transform -translate-y-1/2"
            style={{
              left: `${progress}%`,
              transform: `translateX(-50%) translateY(-50%)`,
              transition: "left 0.3s ease-out",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              {/* Airplane icon - more appropriate for a travel app */}
              <path
                d="M22 12c0 1.1-.9 2-2 2H6l-4 4V6a2 2 0 0 1 2-2h16c1.1 0 2 .9 2 2v6Z"
                fill="currentColor"
                opacity="0.2"
              />
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
            </svg>
          </div>
        </div>

        {/* Message */}
        <p className="text-white/80 text-lg font-medium">{message}</p>
      </div>
    </div>
  );
};
