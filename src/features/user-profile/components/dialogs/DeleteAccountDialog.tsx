import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import { useToast } from '@/components/ui/use-toast';
import { userProfileService } from '../../services/userProfileService';
import { useAuthIntegration } from '@/hooks/integration/useAuthIntegration';

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
  const { logout } = useAuthIntegration();
  const { toast } = useToast();
  
  const isConfirmed = confirmation.toLowerCase() === 'delete';
  
  const handleDeleteAccount = async () => {
    if (!isConfirmed) return;
    
    setIsDeleting(true);
    
    try {
      // Call the new service method that invokes the Edge Function
      const { success, error } = await userProfileService.initiateAccountDeletion();
      
      if (success) {
        toast({
          title: "Account Deletion Initiated",
          description: "Your account deletion has been scheduled. You will receive an email with instructions on how to cancel this process if you change your mind.",
          duration: 8000,
        });
        
        // Close the modal and sign out the user
        onClose();
        // The user's session is still valid, so we log them out gracefully.
        await logout();
        // The useAuth hook will handle redirecting to the home page.
      } else {
        // Use a more specific error message if available from the function
        const errorMessage = (error as Error & { context?: { function_error?: string } })?.context?.function_error || 'Failed to request account deletion. Please try again later.';
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Reset state when the dialog is closed
  useEffect(() => {
    if (!isOpen) {
      setConfirmation('');
      setIsDeleting(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Your Account</DialogTitle>
          <DialogDescription>
            This action will schedule your account for permanent deletion in 30 days. 
            You will receive an email with a link to cancel this process.
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
            disabled={!isConfirmed || isDeleting}
          >
            {isDeleting ? "Processing..." : "Schedule Deletion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { DeleteAccountDialog };
