import React, { useState, useEffect, lazy } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/ui/atoms/Button";
import { Label } from "@/ui/atoms/Label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/ui/atoms/Input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Select } from "@/components/ui/select";
import {
  getAuthService,
  AuthService,
  AuthProviderType,
} from "@/features/auth/authApi";
import { useUserProfileAuthIntegration } from "../../hooks/useUserProfileAuthIntegration";
// DeleteAccountDialog is lazy loaded below
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Lazy load DeleteAccountDialog to avoid circular dependencies
// Using dynamic import with destructuring to handle named exports
const _DeleteAccountDialog = lazy(() =>
  import("./DeleteAccountDialog").then((module) => ({
    default: module.DeleteAccountDialog,
  })),
);

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

// Email change form schema
const emailSchema = z
  .object({
    newEmail: z
      .string()
      .email({ message: "Please enter a valid email address" }),
    // Optional password field for Google users who change email and need to set a password
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // If the user is changing from Google auth, they need to set a password
    if (data.password !== undefined && data.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 8,
        type: "string",
        inclusive: true,
        message: "Password must be at least 8 characters",
        path: ["password"],
      });
    }
  });

type EmailFormValues = z.infer<typeof emailSchema>;

export interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteAccount?: () => void;
  onPasswordChange?: (data: PasswordFormValues) => void;
  onThemeChange?: (isDarkMode: boolean) => void;
  onLanguageChange?: (language: string) => void;
}

/**
 * SettingsDialog - A component for managing user account settings
 * This dialog provides options for theme preferences, language selection, password change, and account deletion
 */
const SettingsDialog = ({
  open,
  onOpenChange,
  onDeleteAccount,
  onPasswordChange,
  onThemeChange,
  onLanguageChange,
}: SettingsDialogProps) => {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [language, setLanguage] = React.useState("english");
  const [changePasswordOpen, setChangePasswordOpen] = React.useState(false);
  const [emailChangeOpen, setEmailChangeOpen] = React.useState(false);
  const [_deleteDialogOpen, _setDeleteDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isEmailLoading, setIsEmailLoading] = React.useState(false);
  const [authProvider, setAuthProvider] = useState<AuthProviderType | null>(
    null,
  );
  const [_authInitialized, setAuthInitialized] = useState(false);

  // Use user profile integration hook for cross-feature operations
  const userProfileIntegration = useUserProfileAuthIntegration();

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
        if (import.meta.env.DEV) {
          console.log("Detected authentication provider:", provider);
        }
        setAuthProvider(provider);
      } catch (error) {
        console.error("Error detecting authentication provider:", error);
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
      alert("Password updated successfully");
    } catch (error) {
      console.error("Error changing password:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update password. Please try again.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const _handleDeleteAccount = async () => {
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
          throw new Error("No authenticated user found");
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

      // Get current user to obtain user ID
      const currentUser = await authService.getCurrentUser();

      if (!currentUser || !currentUser.id) {
        throw new Error("No authenticated user found");
      }

      // Special handling for Google-authenticated users
      if (authProvider === AuthProviderType.GOOGLE) {
        // Validate password requirement for Google users
        if (!data.password || data.password.length < 8) {
          toast({
            title: "Password Required",
            description:
              "You must set a password when changing from Google authentication.",
            variant: "destructive",
          });
          return;
        }

        // Store password in auth state for later use in email verification
        // This is needed for Google to Email conversion
        try {
          // Set password before email change
          await authService.updatePassword("", data.password);
        } catch (passwordError) {
          console.error(
            "Failed to set password for Google user:",
            passwordError,
          );
          toast({
            title: "Password Update Failed",
            description: "Could not update your password. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      // Use integration hook to handle email change across features
      const emailChangeResult =
        await userProfileIntegration.handleEmailChangeRequest(
          currentUser.id,
          data.newEmail,
        );

      if (emailChangeResult.success) {
        // Handle success case with appropriate messaging
        if (authProvider === AuthProviderType.GOOGLE) {
          toast({
            title: "Verification Email Sent",
            description: (
              <div>
                <p>
                  A verification email has been sent to{" "}
                  <span className="font-medium">{data.newEmail}</span>.
                </p>
                <p className="mt-1">
                  Please verify your new email address to complete the change.
                </p>
                <p className="mt-2 text-sm opacity-80">
                  Note: This will disconnect your account from Google Sign-In.
                </p>
              </div>
            ),
            duration: 8000,
          });
        } else {
          toast({
            title: "Verification Email Sent",
            description: (
              <p>
                Please check your inbox to confirm the change to{" "}
                <span className="font-medium">{data.newEmail}</span>.
              </p>
            ),
          });
        }

        setEmailChangeOpen(false);
        emailForm.reset();
      } else {
        // Handle failure case
        toast({
          title: "Email Change Failed",
          description:
            emailChangeResult.message ||
            "Failed to update email. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update email:", error);
      toast({
        title: "Email Change Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update email. Please try again.",
        variant: "destructive",
      });
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
    { value: "german", label: "German" },
  ];

  // Apply dark mode to the document body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
            Settings
          </DialogTitle>
          <DialogDescription className="text-white/70 text-base">
            Customize your account settings and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[calc(85vh-160px)] pr-2" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#8b5cf6 transparent'
        }}>
          <style jsx>{`
            div::-webkit-scrollbar {
              width: 6px;
            }
            div::-webkit-scrollbar-track {
              background: transparent;
            }
            div::-webkit-scrollbar-thumb {
              background: linear-gradient(to bottom, #8b5cf6, #ec4899);
              border-radius: 3px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(to bottom, #7c3aed, #db2777);
            }
          `}</style>
          {/* Theme Toggle */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="theme-mode" className="font-medium text-white/90">
                  Dark Mode
                </Label>
                <p className="text-sm text-white/60 mt-1">
                  Toggle between light and dark theme
                </p>
              </div>
              <Switch
                id="theme-mode"
                checked={isDarkMode}
                onCheckedChange={handleDarkModeToggle}
                className="data-[state=checked]:bg-purple-500"
              />
            </div>
          </div>

          {/* Language */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
            <Label htmlFor="language" className="font-medium text-white/90">
              App Language
            </Label>
            <p className="text-sm text-white/60 mb-3 mt-1">
              Select your preferred language
            </p>
            <Select
              options={languageOptions}
              value={language}
              onValueChange={handleLanguageChange}
              className="w-full bg-black/40 border-white/20 text-white"
            />
          </div>

          {/* Change Password */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
            <h3 className="font-medium mb-1 text-white/90">Password</h3>
            <p className="text-sm text-white/60 mb-3">
              Update your account password
            </p>

            {authProvider === AuthProviderType.GOOGLE ? (
              <>
                <Alert className="mb-3 bg-blue-500/10 border-blue-400/30 text-white">
                  <InfoIcon className="h-4 w-4 text-blue-400" />
                  <AlertTitle className="text-blue-300">Google Account</AlertTitle>
                  <AlertDescription className="text-white/80">
                    You're signed in with Google. Password management is handled
                    through your Google account.
                  </AlertDescription>
                </Alert>
                <Button
                  variant="outline"
                  className="w-full border-white/30 bg-white/10 hover:bg-white/20 text-white"
                  onClick={() =>
                    window.open(
                      "https://myaccount.google.com/security",
                      "_blank",
                    )
                  }
                >
                  Manage Password via Google
                </Button>
              </>
            ) : (
              <Dialog
                open={changePasswordOpen}
                onOpenChange={setChangePasswordOpen}
              >
                <Button
                  variant="outline"
                  onClick={() => setChangePasswordOpen(true)}
                  className="w-full border-white/30 bg-white/10 hover:bg-white/20 text-white"
                >
                  Change Password
                </Button>
                <DialogContent className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">Change Password</DialogTitle>
                    <DialogDescription className="text-white/70">
                      Enter your current password and a new password
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onPasswordSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/90">Current Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                {...field} 
                                className="bg-black/40 border-white/20 focus:border-purple-400/50 focus:ring-purple-400/20 text-white placeholder:text-white/50"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/90">New Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                {...field} 
                                className="bg-black/40 border-white/20 focus:border-purple-400/50 focus:ring-purple-400/20 text-white placeholder:text-white/50"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/90">Confirm New Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                {...field} 
                                className="bg-black/40 border-white/20 focus:border-purple-400/50 focus:ring-purple-400/20 text-white placeholder:text-white/50"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      <DialogFooter className="pt-4">
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => setChangePasswordOpen(false)}
                          disabled={isLoading}
                          className="border-white/30 bg-white/10 hover:bg-white/20 text-white"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isLoading}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                        >
                          {isLoading ? "Updating..." : "Update Password"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Change Email */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
            <h3 className="font-medium mb-1 text-white/90">Email Address</h3>
            <p className="text-sm text-white/60 mb-3">
              Update your email address
            </p>
            <Dialog open={emailChangeOpen} onOpenChange={setEmailChangeOpen}>
              <Button
                variant="outline"
                onClick={() => setEmailChangeOpen(true)}
                className="w-full border-white/30 bg-white/10 hover:bg-white/20 text-white"
              >
                Change Email
              </Button>
              <DialogContent className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-white">Change Email Address</DialogTitle>
                  <DialogDescription className="text-white/70">
                    Enter your new email address. You'll need to verify this
                    email before the change takes effect.
                  </DialogDescription>
                </DialogHeader>

                {authProvider === AuthProviderType.GOOGLE && (
                  <Alert className="mb-4 bg-blue-500/10 border-blue-500/20 text-white">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                      <div>
                        <AlertTitle className="text-white font-medium text-base mb-1">
                          Important: Google Account
                        </AlertTitle>
                        <AlertDescription className="text-white/90">
                          You're currently signed in with Google. Changing your
                          email address here will:
                        </AlertDescription>
                        <ul className="mt-2 ml-6 list-disc space-y-1 text-white/90">
                          <li>Disconnect your account from Google Sign-In</li>
                          <li>
                            Require you to set a password for future logins
                          </li>
                          <li>
                            Use email/password authentication going forward
                          </li>
                        </ul>
                        <AlertDescription className="mt-2 text-white/90">
                          To keep using Google Sign-In, change your email in
                          your Google account instead.
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                )}

                <Form {...emailForm}>
                  <form
                    onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={emailForm.control}
                      name="newEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">New Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              {...field} 
                              className="bg-black/40 border-white/20 focus:border-purple-400/50 focus:ring-purple-400/20 text-white placeholder:text-white/50"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    {authProvider === AuthProviderType.GOOGLE && (
                      <FormField
                        control={emailForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/90">New Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Set a new password for future logins"
                                {...field}
                                className="bg-black/40 border-white/20 focus:border-purple-400/50 focus:ring-purple-400/20 text-white placeholder:text-white/50"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
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
                        className="border-white/30 bg-white/10 hover:bg-white/20 text-white"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isEmailLoading}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                      >
                        {isEmailLoading ? "Updating..." : "Update Email"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <DialogFooter className="pt-6 border-t border-white/10">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-6 py-2 rounded-xl font-semibold transition-all duration-300"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { SettingsDialog };
