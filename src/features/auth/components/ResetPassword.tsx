/**
 * Reset Password Component
 *
 * Component to handle password reset after receiving reset link.
 * Following Planora's architectural principles with feature-first organization.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/ui/atoms/Button";
import { Input } from "@/ui/atoms/Input";
import { Label } from "@/ui/atoms/Label";
import { Logo } from "@/ui/atoms/Logo";
import { ArrowLeft, Key, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { Footer } from "@/ui/organisms/Footer";
import { useToast } from "@/components/ui/use-toast";
// Import service directly to avoid circular dependency
import { supabaseAuthService } from "../services/supabaseAuthService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password validation
  const validatePassword = (
    password: string,
  ): { valid: boolean; message?: string } => {
    if (password.length < 8) {
      return {
        valid: false,
        message: "Password must be at least 8 characters long",
      };
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one number",
      };
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one uppercase letter",
      };
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one lowercase letter",
      };
    }

    return { valid: true };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate passwords
    const validation = validatePassword(password);
    if (!validation.valid) {
      setError(validation.message || "Invalid password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Use service directly to avoid circular dependency

      // Reset password
      const success = await supabaseAuthService.resetPassword(password);

      if (!success) {
        throw new Error(
          "Failed to reset password. The link may have expired. Please request a new password reset link.",
        );
      }

      setResetComplete(true);

      toast({
        title: "Password reset successful",
        description:
          "Your password has been updated successfully. You can now log in with your new password.",
      });
    } catch (err) {
      console.error("Error resetting password:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );

      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="relative z-10 mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          {/* Logo */}
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>

          <div className="bg-card/20 backdrop-blur-lg p-6 rounded-lg border border-white/10 shadow-lg">
            {resetComplete ? (
              <div className="text-center space-y-6">
                <div className="mx-auto bg-planora-accent-purple/10 w-20 h-20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-planora-accent-purple" />
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl font-medium">
                    Password Reset Complete
                  </h2>
                  <p className="text-white/70">
                    Your password has been reset successfully. You can now log
                    in with your new password.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    className="w-full bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink"
                    onClick={() => navigate("/login")}
                  >
                    Continue to Login
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Create new password
                  </h1>
                  <p className="text-sm text-white/60 mt-2">
                    Enter a new secure password for your account
                  </p>
                </div>

                {error && (
                  <Alert className="mb-4 bg-red-500/10 border-red-500/50">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription className="text-white/80">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        required
                        className="pr-10"
                      />
                      <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                    </div>
                    <p className="text-xs text-white/40 mt-1">
                      Must be at least 8 characters with a number and uppercase
                      letter
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isSubmitting}
                        required
                        className="pr-10"
                      />
                      <Shield className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>

                <div className="text-center mt-4">
                  <Button
                    variant="link"
                    className="text-white/60 hover:text-white"
                    onClick={() => navigate("/login")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto relative z-10">
        <Footer />
      </div>
    </div>
  );
};
