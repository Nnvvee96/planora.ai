/**
 * VerificationDialog Component
 * 
 * Dialog for email verification with code input.
 * Following Planora's architectural principles with feature-first organization.
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '../hooks/useAuth';
import { VerificationCodeResponse } from '../types/authTypes';

interface VerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  userId: string;
  onVerify: (success: boolean) => void;
  onResend: () => Promise<void>;
}

export function VerificationDialog({ 
  isOpen, 
  onClose, 
  email, 
  userId, 
  onVerify, 
  onResend 
}: VerificationDialogProps) {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { getAuthService } = useAuth();
  
  const handleVerify = async () => {
    try {
      if (!code || code.length !== 6) {
        setError('Please enter a valid 6-digit code');
        return;
      }
      
      setIsSubmitting(true);
      setError('');
      
      const authService = getAuthService();
      const result: VerificationCodeResponse = await authService.verifyCode(userId, code);
      
      if (result.success) {
        // Refresh the session to ensure the user is logged in with updated verification status
        try {
          await authService.refreshSession();
          console.log('Session refreshed after verification');
          
          // Check if onboarding is completed
          const hasCompletedOnboarding = await authService.checkOnboardingStatus(userId);
          
          toast({
            title: "Email verified successfully",
            description: hasCompletedOnboarding 
              ? "Your account has been verified. Redirecting to dashboard." 
              : "Your account has been verified. Let's complete your profile.",
          });
          
          onVerify(true);
        } catch (refreshErr) {
          console.warn('Error refreshing session after verification:', refreshErr);
          // Still consider this a success - the verification worked
          onVerify(true);
        }
      } else {
        setError(result.error || 'Invalid verification code. Please try again.');
        onVerify(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify code';
      setError(errorMessage);
      console.error('Verification error:', err);
      onVerify(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResend = async () => {
    try {
      setIsResending(true);
      setError('');
      
      await onResend();
      
      toast({
        title: "Verification code sent",
        description: `A new verification code has been sent to ${email}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend code';
      setError(errorMessage);
      console.error('Error resending code:', err);
    } finally {
      setIsResending(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and max 6 characters
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setCode(value);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card/90 backdrop-blur-xl border border-white/10 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Verify Your Email</DialogTitle>
          <DialogDescription className="text-white/70">
            We've sent a verification code to <span className="font-medium text-white">{email}</span>. 
            Enter the 6-digit code below to complete your registration.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Input
            value={code}
            onChange={handleInputChange}
            placeholder="Enter 6-digit code"
            className="text-center text-lg tracking-widest bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20"
            maxLength={6}
            inputMode="numeric"
            pattern="[0-9]*"
            autoFocus
          />
          
          {error && (
            <div className="text-planora-accent-pink text-sm">{error}</div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleResend}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            disabled={isResending || isSubmitting}
          >
            {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Resend Code
          </Button>
          <Button
            className="bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink hover:opacity-90 text-white"
            onClick={handleVerify}
            disabled={isSubmitting || code.length !== 6}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
