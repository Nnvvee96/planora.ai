/**
 * Forgot Password Component
 *
 * Component to handle password reset request.
 * Following Planora's architectural principles with feature-first organization.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/ui/atoms/Button";
import { Input } from "@/ui/atoms/Input";
import { Label } from "@/ui/atoms/Label";
import { Logo } from "@/ui/atoms/Logo";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Footer } from "@/ui/organisms/Footer";
import { useToast } from "@/hooks/use-toast";
// Import service directly to avoid circular dependency
import { supabaseAuthService } from "../services/supabaseAuthService";

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Use service directly to avoid circular dependency

      // Send password reset email
      const success = await supabaseAuthService.sendPasswordResetEmail(email);

      if (!success) {
        throw new Error(
          "Failed to send password reset email. Please try again.",
        );
      }

      setEmailSent(true);

      toast({
        title: "Reset email sent",
        description: `We've sent a password reset link to ${email}. Please check your inbox.`,
      });
    } catch (err) {
      console.error("Error sending password reset email:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );

      toast({
        title: "Error",
        description:
          err instanceof Error
            ? err.message
            : "Failed to send password reset email",
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
            {emailSent ? (
              <div className="text-center space-y-6">
                <div className="mx-auto bg-planora-accent-purple/10 w-20 h-20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-planora-accent-purple" />
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl font-medium">Check your inbox</h2>
                  <p className="text-white/70">
                    We've sent a password reset link to{" "}
                    <span className="text-white font-medium">{email}</span>.
                    Click the link in the email to reset your password.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    className="w-full bg-white/10 hover:bg-white/20 text-white"
                    onClick={() => navigate("/login")}
                  >
                    Back to Login
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Reset your password
                  </h1>
                  <p className="text-sm text-white/60 mt-2">
                    Enter your email and we'll send you a link to reset your
                    password
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md text-sm text-red-500">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Mail className="mr-2 h-4 w-4 animate-pulse" />
                        Sending...
                      </>
                    ) : (
                      "Send reset link"
                    )}
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
