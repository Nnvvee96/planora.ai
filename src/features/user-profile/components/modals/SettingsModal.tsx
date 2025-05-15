import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select } from '@/components/ui/select';
import { supabase } from '@/lib/supabase/supabaseClient';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string().min(8),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);

export type PasswordFormValues = z.infer<typeof passwordSchema>;

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
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      setIsLoading(true);
      // Here you would update the password via supabase or your auth provider
      
      // Call the callback if provided
      if (onPasswordChange) {
        await onPasswordChange(data);
      }
      
      // Reset form and close dialog
      form.reset();
      setChangePasswordOpen(false);
      
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to update password. Please try again.");
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
        const { error } = await supabase.auth.admin.deleteUser(
          (await supabase.auth.getUser()).data.user?.id || ''
        );
        
        if (error) throw error;
        
        // Sign out after successful deletion
        await supabase.auth.signOut();
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
          </div>

          {/* Account Options */}
          <div>
            <h3 className="font-medium text-destructive mb-1">Account Options</h3>
            <p className="text-sm text-muted-foreground mb-2">Permanently delete your account and all data</p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-destructive"
                    onClick={handleDeleteAccount}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Deleting...' : 'Delete Account'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
