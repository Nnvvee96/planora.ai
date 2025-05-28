/**
 * Email Change Verification Component
 * 
 * Specialized component to handle email change verification flow.
 * This component ensures proper auth state and database state synchronization.
 * Following Planora's architectural principles with feature-first organization.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/ui/atoms/Button';
import { Logo } from '@/ui/atoms/Logo';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { getAuthService } from '../authApi';
import { userProfileService } from '@/features/user-profile/services/userProfileService';
// Import Supabase for direct database operations
import { supabase } from '@/database/databaseExports';

/**
 * EmailChangeVerification component handles the verification of email changes
 * and proper synchronization between auth state and database state
 */
export const EmailChangeVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wasGoogleUser, setWasGoogleUser] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  
  useEffect(() => {
    const verifyEmailChange = async () => {
      try {
        setIsVerifying(true);
        
        // Extract token and type from URL params
        const token = searchParams.get('token') || 
                     searchParams.get('confirmation_token') || 
                     searchParams.get('t');
        
        // Check if we have a token
        if (!token) {
          setError('No verification token found in URL. Please check your email link.');
          setIsVerifying(false);
          return;
        }
        
        // Verify the email using our auth service
        const authService = getAuthService();
        
        // Check if verifyEmail method exists on the auth service
        if (typeof authService.verifyEmail !== 'function') {
          console.error('verifyEmail method not found on auth service');
          setError('Verification service unavailable. Please contact support.');
          setVerificationSuccess(false);
          setIsVerifying(false);
          return;
        }
        
        const success = await authService.verifyEmail(token);
        
        if (!success) {
          setError('Failed to verify email change. The link may have expired or been used already.');
          setVerificationSuccess(false);
          setIsVerifying(false);
          return;
        }
        
        // Get the current user after verification
        const user = await authService.getCurrentUser();
        
        if (!user) {
          // This is expected - user might be logged out during email verification
          // Set success but note they need to log in again
          setVerificationSuccess(true);
          setIsVerifying(false);
          return;
        }
        
        // Check if this was a Google user who changed to email auth
        const wasGoogle = searchParams.get('provider_change') === 'google_to_email';
        setWasGoogleUser(wasGoogle);
        
        // Store email for display
        setEmail(user.email);
        
        // Now we need to sync the database profile with the new email
        // This ensures the database is updated even if the user didn't wait
        // for the verification before closing the browser
        try {
          // Update both directly through the profile service and through the auth service
          // for maximum resilience
          await userProfileService.updateUserProfile(user.id, {
            email: user.email,
            emailVerified: true // Use the property name from UserProfile type
            // No updatedAt - it will be handled by the service
          });
          
          // Also update database directly to handle properties that might not be in the UserProfile type
          try {
            await supabase
              .from('profiles')
              .update({
                pending_email_change: null,
                email_change_requested_at: null,
                email_verified: true, // Actual database column name
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id);
          } catch (dbErr) {
            console.warn('Error updating profile columns in database:', dbErr);
          }
          
          // Also update the email_change_tracking table if it exists
          try {
            await supabase
              .from('email_change_tracking')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString()
              })
              .eq('user_id', user.id)
              .eq('status', 'pending');
          } catch (trackingErr) {
            // Non-critical error, just log it
            console.warn('Error updating email change tracking:', trackingErr);
          }
        } catch (profileErr) {
          console.warn('Error updating profile during verification:', profileErr);
          // Non-critical error, continue with the process
        }
        
        // Set verification as successful
        setVerificationSuccess(true);
      } catch (err) {
        console.error('Error during email change verification:', err);
        setError('An unexpected error occurred during verification. Please try again.');
        setVerificationSuccess(false);
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyEmailChange();
  }, [searchParams]);
  
  return (
    <div className="min-h-screen bg-planora-purple-dark flex flex-col">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-planora-purple-dark via-planora-purple-dark to-black opacity-90 z-0"></div>
      
      {/* Subtle gradient accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-planora-accent-purple/5 blur-3xl"></div>
        <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-planora-accent-blue/5 blur-3xl"></div>
      </div>
      
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="relative z-10 mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          
          <div className="bg-card/20 backdrop-blur-lg p-8 rounded-lg border border-white/10 shadow-lg">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-semibold tracking-tight mb-4">
                Email Change Verification
              </h1>
              
              {isVerifying ? (
                <div className="flex flex-col items-center py-6">
                  <Loader2 className="h-10 w-10 text-planora-accent-purple animate-spin mb-4" />
                  <p className="text-white/70">Verifying your email address change...</p>
                </div>
              ) : verificationSuccess ? (
                <div className="space-y-6">
                  <div className="mx-auto bg-planora-accent-purple/10 w-20 h-20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-planora-accent-purple" />
                  </div>
                  
                  <div className="space-y-3">
                    <h2 className="text-xl font-medium">Email Changed Successfully</h2>
                    <p className="text-white/70">
                      {email ? (
                        <>Your email has been successfully changed to <span className="font-medium text-white">{email}</span>.</>
                      ) : (
                        <>Your email has been successfully verified.</>
                      )}
                    </p>
                    
                    {wasGoogleUser && (
                      <Alert className="bg-blue-500/10 border-blue-500/20 mt-4">
                        <AlertTitle>Authentication Method Changed</AlertTitle>
                        <AlertDescription className="text-white/80">
                          Your account now uses email/password authentication instead of Google Sign-In.
                          Please use your email and password to log in from now on.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink"
                    onClick={() => navigate('/login')}
                  >
                    Continue to Login
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="mx-auto bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                  </div>
                  
                  {error && (
                    <Alert className="bg-red-500/10 border-red-500/20">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <AlertTitle>Verification Failed</AlertTitle>
                      <AlertDescription className="text-white/80">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-4 pt-2">
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center gap-2 w-full"
                      onClick={() => navigate('/login')}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Login
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailChangeVerification;
