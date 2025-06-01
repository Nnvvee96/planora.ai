import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import { useToast } from '@/components/ui/use-toast';
import { userProfileService } from '../../services/userProfileService';
import { getAuthService, AuthService } from '@/features/auth/authApi';

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * DeleteAccountDialog - A component for requesting account deletion with a 30-day recovery period
 * 
 * This dialog implements a secure and user-friendly account deletion flow following
 * industry best practices. It requires the user to type "delete" to confirm the deletion
 * and clearly explains the 30-day recovery period.
 */
const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({ isOpen, onClose }) => {
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
        toast({
          title: "Error",
          description: "Failed to get user information. Please try again later.",
          variant: "destructive"
        });
      }
    };
    
    fetchCurrentUser();
  }, [authService, toast]);
  
  const isConfirmed = confirmation.toLowerCase() === 'delete';
  
  const handleDeleteAccount = async () => {
    if (!currentUser || !isConfirmed) return;
    
    setIsDeleting(true);
    
    try {
      // Request account deletion
      const deleted = await userProfileService.deleteUserProfile(currentUser.id);
      
      if (deleted) {
        toast({
          title: "Account Deletion Requested",
          description: "Your account will be deleted after a 30-day recovery period. You will receive an email confirmation.",
          duration: 5000,
        });
        
        // Close the modal and sign out the user
        onClose();
        if (authService) {
          await authService.logout();
          // Redirect to home page will happen via auth state change
        }
      } else {
        throw new Error("Failed to delete account");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request account deletion. Please try again later.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={value => !isDeleting && !value && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            This action cannot be undone immediately. Your account will enter a 30-day recovery period.
            After 30 days, all your data will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            To confirm, please type <strong>delete</strong> in the field below.
          </p>
          
          <Input 
            placeholder="Type 'delete' to confirm" 
            value={confirmation} 
            onChange={e => setConfirmation(e.target.value)}
            className="col-span-3"
            autoComplete="off"
            disabled={isDeleting}
          />
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

export { DeleteAccountDialog };
