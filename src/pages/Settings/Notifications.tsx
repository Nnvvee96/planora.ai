import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

const Notifications = () => {
  // Email notification settings
  const [emailSettings, setEmailSettings] = useState({
    tripUpdates: true,
    promotions: false,
    newFeatures: true,
    newsletter: true,
    tripReminders: true,
  });

  // App notification settings
  const [appSettings, setAppSettings] = useState({
    tripUpdates: true,
    priceAlerts: true,
    chatResponses: true,
    newFeatures: false,
    tripReminders: true,
  });

  const handleEmailSettingChange = (setting: keyof typeof emailSettings) => {
    setEmailSettings({
      ...emailSettings,
      [setting]: !emailSettings[setting],
    });
  };

  const handleAppSettingChange = (setting: keyof typeof appSettings) => {
    setAppSettings({
      ...appSettings,
      [setting]: !appSettings[setting],
    });
  };

  const handleSave = () => {
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Notification Settings</h1>

        {/* Email Notifications */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>
              Manage the emails you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Label className="font-medium">Trip Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails about changes to your planned trips
                </p>
              </div>
              <Switch
                checked={emailSettings.tripUpdates}
                onCheckedChange={() => handleEmailSettingChange("tripUpdates")}
              />
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <Label className="font-medium">Promotions</Label>
                <p className="text-sm text-muted-foreground">
                  Special offers and discounts for Planora users
                </p>
              </div>
              <Switch
                checked={emailSettings.promotions}
                onCheckedChange={() => handleEmailSettingChange("promotions")}
              />
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <Label className="font-medium">New Features</Label>
                <p className="text-sm text-muted-foreground">
                  Updates about new Planora features and improvements
                </p>
              </div>
              <Switch
                checked={emailSettings.newFeatures}
                onCheckedChange={() => handleEmailSettingChange("newFeatures")}
              />
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <Label className="font-medium">Newsletter</Label>
                <p className="text-sm text-muted-foreground">
                  Monthly travel inspiration and tips
                </p>
              </div>
              <Switch
                checked={emailSettings.newsletter}
                onCheckedChange={() => handleEmailSettingChange("newsletter")}
              />
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <Label className="font-medium">Trip Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Reminders about upcoming trips and reservations
                </p>
              </div>
              <Switch
                checked={emailSettings.tripReminders}
                onCheckedChange={() =>
                  handleEmailSettingChange("tripReminders")
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* App Notifications */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>App Notifications</CardTitle>
            <CardDescription>
              Control notifications within the Planora app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Label className="font-medium">Trip Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications about changes to your planned trips
                </p>
              </div>
              <Switch
                checked={appSettings.tripUpdates}
                onCheckedChange={() => handleAppSettingChange("tripUpdates")}
              />
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <Label className="font-medium">Price Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications when prices drop for saved destinations
                </p>
              </div>
              <Switch
                checked={appSettings.priceAlerts}
                onCheckedChange={() => handleAppSettingChange("priceAlerts")}
              />
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <Label className="font-medium">Chat Responses</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications when Planora responds to your chat messages
                </p>
              </div>
              <Switch
                checked={appSettings.chatResponses}
                onCheckedChange={() => handleAppSettingChange("chatResponses")}
              />
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <Label className="font-medium">New Features</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications about new Planora features
                </p>
              </div>
              <Switch
                checked={appSettings.newFeatures}
                onCheckedChange={() => handleAppSettingChange("newFeatures")}
              />
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <Label className="font-medium">Trip Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Reminders about upcoming trips
                </p>
              </div>
              <Switch
                checked={appSettings.tripReminders}
                onCheckedChange={() => handleAppSettingChange("tripReminders")}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export { Notifications };
