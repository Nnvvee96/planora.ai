import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import { useToast } from '@/components/ui/use-toast';
import { userProfileService } from '../../services/userProfileService';
import { getAuthService, AuthService } from '@/features/auth/authApi';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * DeleteAccountModal - A component for requesting account deletion with a 30-day recovery period
 * 
 * This modal implements a secure and user-friendly account deletion flow following
 * industry best practices. It requires the user to type "delete" to confirm the deletion
 * and clearly explains the 30-day recovery period.
 */
export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [authService, setAuthService] = useState<AuthService | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const { toast } = useToast();
  
  // Initialize auth service on component mount
  useEffect(() => {
    setAuthService(getAuthService());
  }, []);
  
  // Get current user when auth service is available
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!authService) return;
      
      try {
        const user = await authService.getCurrentUser();
        if (user && user.id && user.email) {
          setCurrentUser({
            id: user.id,
            email: user.email
          });
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    
    fetchCurrentUser();
  }, [authService]);
  
  // Handle the deletion request
  const handleDeleteAccount = async () => {
    if (!authService || !currentUser?.id || !currentUser?.email) {
      toast({
        title: "Error",
        description: "Unable to identify your account. Please try signing in again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const result = await userProfileService.requestAccountDeletion(currentUser.id, currentUser.email);
      
      if (result.success) {
        toast({
          title: "Account Deletion Requested",
          description: "Your account is scheduled for deletion in 30 days. A confirmation email has been sent with instructions on how to recover your account if needed.",
        });
        
        // Sign the user out
        await authService.logout();
        onClose();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to request account deletion. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Unexpected error during account deletion request:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Check if the user has typed the confirmation correctly
  const isConfirmed = confirmation.toLowerCase() === 'delete';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete Your Account</DialogTitle>
          <DialogDescription>
            This action will schedule your account for deletion after a 30-day recovery period.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">
              During the 30-day period, you can recover your account by:
            </p>
            
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Clicking the recovery link in the email we'll send you</li>
              <li>Signing back in to your account</li>
            </ul>
            
            <div className="rounded-md bg-amber-50 p-4 border border-amber-200 mt-2">
              <p className="text-sm text-amber-800">
                <strong>Warning:</strong> After 30 days, your account and all associated data will be permanently deleted. This action cannot be undone.
              </p>
            </div>
          </div>
          
          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium">To confirm, please type "delete" below:</p>
            <Input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Type 'delete' to confirm"
              className="w-full"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteAccount} 
            disabled={!isConfirmed || isDeleting || !currentUser}
          >
            {isDeleting ? "Processing..." : "Delete My Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
