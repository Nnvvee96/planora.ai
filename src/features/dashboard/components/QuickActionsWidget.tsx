import React from "react";
import { Button } from "@/ui/atoms/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/ui/atoms/Card";
import { useToast } from "@/hooks/use-toast";

export const QuickActionsWidget = () => {
  const { toast } = useToast();

  const handleClearCache = () => {
    // In a real implementation, this would clear localStorage, sessionStorage, etc.
    toast({
      title: "Success",
      description: "Local cache cleared. (Placeholder)",
    });
  };

  const handleRefetchProfile = () => {
    // This would typically trigger a re-fetch via a global state management library or context
    toast({
      title: "Success",
      description: "User profile re-fetched. (Placeholder)",
    });
  };

  const handleTriggerWelcomeEmail = () => {
    // This would call a service to trigger a backend endpoint
    toast({
      title: "Success",
      description: "Welcome email triggered. (Placeholder)",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Tools for beta testing and development.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Button onClick={handleClearCache}>Clear Local Cache</Button>
        <Button onClick={handleRefetchProfile} variant="outline">
          Re-fetch User Profile
        </Button>
        <Button onClick={handleTriggerWelcomeEmail} variant="outline">
          Trigger Welcome Email
        </Button>
      </CardContent>
    </Card>
  );
};
