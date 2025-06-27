/**
 * Email Confirmation Component
 *
 * Component to handle email verification after users click the link in their email.
 * Following Planora's architectural principles with feature-first organization.
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/ui/atoms/Button";
import { Logo } from "@/ui/atoms/Logo";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
// Import service directly to avoid circular dependency
import { supabaseAuthService } from "../services/supabaseAuthService";

/**
 * Email confirmation component for handling verification links
 * Follows Planora's architecture with feature-first organization
 */
const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        setIsVerifying(true);

        // Extract token from URL params (Supabase puts it in different params depending on flow)
        const token =
          searchParams.get("token") ||
          searchParams.get("confirmation_token") ||
          searchParams.get("t");

        // Check if we have a token
        if (!token) {
          setError(
            "No verification token found in URL. Please check your email link.",
          );
          setIsVerifying(false);
          return;
        }

        // Use service directly to avoid circular dependency
        // Add proper error handling for email verification
        try {
          const success = await supabaseAuthService.verifyEmail(token);
          setVerificationSuccess(success);

          if (!success) {
            setError(
              "Failed to verify email. The link may have expired or been used already.",
            );
          }
        } catch (verificationError) {
          console.error("Email verification service error:", verificationError);
          setError(
            "Email verification service temporarily unavailable. Please try again later.",
          );
          setVerificationSuccess(false);
        }
      } catch (err) {
        console.error("Error during email verification:", err);
        setError(
          "An unexpected error occurred during verification. Please try again.",
        );
        setVerificationSuccess(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
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
                Email Verification
              </h1>

              {isVerifying ? (
                <div className="flex flex-col items-center py-6">
                  <Loader2 className="h-10 w-10 text-planora-accent-purple animate-spin mb-4" />
                  <p className="text-white/70">
                    Verifying your email address...
                  </p>
                </div>
              ) : verificationSuccess ? (
                <div className="space-y-6">
                  <div className="mx-auto bg-planora-accent-purple/10 w-20 h-20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-planora-accent-purple" />
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-xl font-medium">Email Verified</h2>
                    <p className="text-white/70">
                      Your email has been successfully verified. You can now log
                      in to your account.
                    </p>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink"
                    onClick={() => navigate("/login")}
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
                      onClick={() => navigate("/login")}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Login
                    </Button>

                    <Button
                      variant="link"
                      className="w-full text-planora-accent-purple hover:text-planora-accent-pink"
                      onClick={() => navigate("/register")}
                    >
                      Try Registering Again
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
export { EmailConfirmation };
