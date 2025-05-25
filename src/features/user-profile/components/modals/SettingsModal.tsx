import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/ui/atoms/Button';
import { Label } from '@/ui/atoms/Label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/ui/atoms/Input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select } from '@/components/ui/select';
import { getAuthService, AuthService, AuthProviderType } from '@/features/auth/api';
import { userProfileService } from '../../services/userProfileService';
import { DeleteAccountModal } from './DeleteAccountModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

type PasswordFormValues = z.infer<typeof passwordSchema>;

// Email change form schema
const emailSchema = z.object({
  newEmail: z.string().email({ message: "Please enter a valid email address" }),
  // Optional password field for Google users who change email and need to set a password
  password: z.string().optional(),
}).superRefine((data, ctx) => {
  // If the user is changing from Google auth, they need to set a password
  if (data.password !== undefined && data.password.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      minimum: 8,
      type: "string",
      inclusive: true,
      message: "Password must be at least 8 characters",
      path: ["password"]
    });
  }
});

type EmailFormValues = z.infer<typeof emailSchema>;

export interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteAccount?: () => void;
  onPasswordChange?: (data: PasswordFormValues) => void;
  onThemeChange?: (isDarkMode: boolean) => void;
  onLanguageChange?: (language: string) => void;
}

/**
 * SettingsModal - A component for managing user account settings
 * This modal provides options for theme preferences, language selection, password change, and account deletion
 */
const SettingsModal: React.FC<SettingsModalProps> = ({ 
  open, 
  onOpenChange,
  onDeleteAccount,
  onPasswordChange,
  onThemeChange,
  onLanguageChange 
}) => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [language, setLanguage] = React.useState("english");
  const [changePasswordOpen, setChangePasswordOpen] = React.useState(false);
  const [emailChangeOpen, setEmailChangeOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isEmailLoading, setIsEmailLoading] = React.useState(false);
  const [authProvider, setAuthProvider] = useState<AuthProviderType | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Initialize auth service using factory function
  const [authService, setAuthService] = useState<AuthService | null>(null);
  
  // Load auth service on component mount
  useEffect(() => {
    setAuthService(getAuthService());
  }, []);
  
  // Detect authentication provider when auth service is available
  useEffect(() => {
    const detectAuthProvider = async () => {
      if (!authService) return;
      
      try {
        const provider = await authService.getAuthProvider();
        console.log('Detected authentication provider:', provider);
        setAuthProvider(provider);
      } catch (error) {
        console.error('Error detecting authentication provider:', error);
        // Default to email provider if detection fails
        setAuthProvider(AuthProviderType.EMAIL);
      } finally {
        setAuthInitialized(true);
      }
    };
    
    detectAuthProvider();
  }, [authService]);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Initialize email form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      newEmail: "",
      password: "",
    },
  });

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      setIsLoading(true);
      
      // Update password through the auth service to maintain proper architectural boundaries
      await authService.updatePassword(data.currentPassword, data.newPassword);
      
      // Call the callback if provided
      if (onPasswordChange) {
        await onPasswordChange(data);
      }
      
      // Reset form and close dialog
      form.reset();
      setChangePasswordOpen(false);
      
      // Show success message
      alert('Password updated successfully');
      
    } catch (error) {
      console.error("Error changing password:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update password. Please try again.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      
      // If callback provided, call it
      if (onDeleteAccount) {
        await onDeleteAccount();
      } else {
        // Default implementation if no callback provided
        // Get current user
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) {
          throw new Error('No authenticated user found');
        }
        
        // Delete the user's profile and account
        // This implementation would need to be properly created in the user profile service
        // For now we'll just log out
        
        // Log out after deletion
        await authService.logout();
      }
      
      // Close modal after deletion
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    if (onThemeChange) {
      onThemeChange(checked);
    }
  };

  // Handle email change submission
  const onEmailSubmit = async (data: EmailFormValues) => {
    if (!authService) return;
    
    try {
      setIsEmailLoading(true);
      
      // Special handling for Google-authenticated users
      if (authProvider === AuthProviderType.GOOGLE) {
        // Validate password requirement for Google users
        if (!data.password || data.password.length < 8) {
          alert("You must set a password when changing from Google authentication");
          return;
        }
        
        // Call the enhanced updateEmail method with password parameter
        // This will handle the Google-to-email conversion
        await authService.updateEmail(data.newEmail, data.password);
        
        alert("A verification email has been sent to " + data.newEmail + ". Please verify your new email address to complete the change. Note: This will disconnect your account from Google Sign-In.");
      } else {
        // Standard email change for email/password users
        await authService.updateEmail(data.newEmail);
        alert("Verification email sent to " + data.newEmail + ". Please check your inbox to confirm the change.");
      }
      
      setEmailChangeOpen(false);
      emailForm.reset();
    } catch (error) {
      console.error("Failed to update email:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update email. Please try again.";
      alert(errorMessage);
    } finally {
      setIsEmailLoading(false);
    }
  };
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    if (onLanguageChange) {
      onLanguageChange(value);
    }
  };

  const languageOptions = [
    { value: "english", label: "English" },
    { value: "spanish", label: "Spanish" },
    { value: "french", label: "French" },
    { value: "german", label: "German" }
  ];

  // Apply dark mode to the document body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your account settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="theme-mode" className="font-medium">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
            </div>
            <Switch 
              id="theme-mode" 
              checked={isDarkMode}
              onCheckedChange={handleDarkModeToggle}
            />
          </div>

          {/* Language */}
          <div>
            <Label htmlFor="language" className="font-medium">App Language</Label>
            <p className="text-sm text-muted-foreground mb-2">Select your preferred language</p>
            <Select
              options={languageOptions}
              value={language}
              onValueChange={handleLanguageChange}
              className="w-full"
            />
          </div>

          {/* Change Password */}
          <div>
            <h3 className="font-medium mb-1">Password</h3>
            <p className="text-sm text-muted-foreground mb-2">Update your account password</p>
            
            {authProvider === AuthProviderType.GOOGLE ? (
              <>
                <Alert className="mb-3">
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Google Account</AlertTitle>
                  <AlertDescription>
                    You're signed in with Google. Password management is handled through your Google account.
                  </AlertDescription>
                </Alert>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('https://myaccount.google.com/security', '_blank')}
                >
                  Manage Password via Google
                </Button>
              </>
            ) : (
              <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
                <Button 
                  variant="outline" 
                  onClick={() => setChangePasswordOpen(true)}
                  className="w-full"
                >
                  Change Password
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and a new password
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter className="pt-4">
                        <Button 
                          variant="outline" 
                          type="button" 
                          onClick={() => setChangePasswordOpen(false)}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Updating...' : 'Update Password'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Change Email */}
          <div>
            <h3 className="font-medium mb-1">Email Address</h3>
            <p className="text-sm text-muted-foreground mb-2">Update your email address</p>
            <Dialog open={emailChangeOpen} onOpenChange={setEmailChangeOpen}>
              <Button 
                variant="outline" 
                onClick={() => setEmailChangeOpen(true)}
                className="w-full"
              >
                Change Email
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Email Address</DialogTitle>
                  <DialogDescription>
                    Enter your new email address. You'll need to verify this email before the change takes effect.
                  </DialogDescription>
                </DialogHeader>
                
                {authProvider === AuthProviderType.GOOGLE && (
                  <Alert className="my-3 border-yellow-500 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
                    <InfoIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <AlertTitle>Important: Google Account</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">
                        You're currently signed in with Google. Changing your email address here will:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Disconnect your account from Google Sign-In</li>
                        <li>Require you to set a password for future logins</li>
                        <li>Use email/password authentication going forward</li>
                      </ul>
                      <p className="mt-2">
                        To keep using Google Sign-In, change your email in your Google account instead.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
                
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="newEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {authProvider === AuthProviderType.GOOGLE && (
                      <FormField
                        control={emailForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Set a new password for future logins" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <DialogFooter className="pt-4">
                      <Button 
                        variant="outline" 
                        type="button" 
                        onClick={() => setEmailChangeOpen(false)}
                        disabled={isEmailLoading}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isEmailLoading}
                      >
                        {isEmailLoading ? 'Updating...' : 'Update Email'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Account Options */}
          <div>
            <h3 className="font-medium text-destructive mb-1">Account Options</h3>
            <p className="text-sm text-muted-foreground mb-2">Permanently delete your account and all data</p>
            
            {/* Delete Account Button */}
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete Account
            </Button>
            
            {/* Delete Account Modal with 30-day recovery period */}
            <DeleteAccountModal 
              isOpen={deleteModalOpen} 
              onClose={() => setDeleteModalOpen(false)} 
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { SettingsModal };
