/**
 * GoogleLoginButton Component
 * 
 * Button for initiating Google Sign-In flow.
 * Following Planora's architectural principles with feature-first organization.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from './AuthProvider';
import { FaGoogle } from 'react-icons/fa';

interface GoogleLoginButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  fullWidth?: boolean;
  text?: string;
}

/**
 * Google login button component
 * Triggers the Google OAuth flow when clicked
 */
export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  className = '',
  variant = 'default',
  size = 'default',
  fullWidth = false,
  text = 'Sign in with Google'
}) => {
  const { signInWithGoogle, loading } = useAuthContext();
  
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className={`${className} ${fullWidth ? 'w-full' : ''}`}
      onClick={handleGoogleLogin}
      disabled={loading}
    >
      <FaGoogle className="mr-2" />
      {loading ? 'Signing in...' : text}
    </Button>
  );
};
