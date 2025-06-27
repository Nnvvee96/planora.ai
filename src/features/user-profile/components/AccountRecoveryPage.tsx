import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/ui/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { userProfileService } from "../services/userProfileService";

/**
 * AccountRecoveryPage - Handles account recovery from deletion
 *
 * This component processes recovery tokens from email links and allows
 * users to recover their accounts during the 30-day deletion period.
 */
const AccountRecoveryPage = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const processRecoveryToken = async () => {
      try {
        // Extract token from URL
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get("token");

        if (!token) {
          setError(
            "No recovery token found in the URL. Please check your recovery link.",
          );
          setIsProcessing(false);
          return;
        }

        // Process the recovery
        const result = await userProfileService.recoverAccount(token);

        if (result.success) {
          setIsSuccess(true);
        } else {
          setError(
            result.error ||
              "Failed to recover your account. The recovery link may have expired.",
          );
        }
      } catch (error) {
        console.error("Error processing recovery token:", error);
        setError(
          "An unexpected error occurred. Please try again or contact support.",
        );
      } finally {
        setIsProcessing(false);
      }
    };

    processRecoveryToken();
  }, [location]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {isProcessing
              ? "Processing Recovery..."
              : isSuccess
                ? "Account Recovered!"
                : "Account Recovery Failed"}
          </CardTitle>
          <CardDescription>
            {isProcessing
              ? "Please wait while we process your request..."
              : isSuccess
                ? "Your account has been successfully recovered."
                : "We encountered an issue recovering your account."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isProcessing ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : isSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-800">
              <p className="font-medium">
                Your account has been successfully recovered!
              </p>
              <p className="mt-2">
                Your account is now active again. You can sign in using your
                existing credentials.
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
              <p className="font-medium">Recovery Failed</p>
              <p className="mt-2">{error}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end space-x-2">
          {!isProcessing && (
            <>
              {isSuccess ? (
                <Button onClick={() => navigate("/signin")}>Sign In</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Go to Home
                  </Button>
                  <Button onClick={() => navigate("/signin")}>
                    Try Signing In
                  </Button>
                </>
              )}
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export { AccountRecoveryPage };
