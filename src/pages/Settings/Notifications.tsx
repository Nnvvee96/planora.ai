import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/atoms/Card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/ui/atoms/Button";
import { Label } from "@/ui/atoms/Label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Modern Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto py-8 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Modern Header with Back Button */}
          <div className="flex items-center gap-4 mb-12">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="shrink-0 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
            >
              <ArrowLeft className="h-8 w-8" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                Notification Settings
              </h1>
              <p className="text-white/60 mt-2">Manage how you receive updates and alerts</p>
            </div>
          </div>

          {/* Email Notifications */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full mr-4"></div>
              Email Notifications
            </h2>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Card className="relative bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30">
                      <Mail className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-xl">Email Notifications</CardTitle>
                      <CardDescription className="text-white/70">
                        Choose what updates you'd like to receive via email
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
                    <div>
                      <Label className="font-semibold text-white text-base">Trip Updates</Label>
                      <p className="text-sm text-white/70 mt-1">Get notified about changes to your travel plans</p>
                    </div>
                    <Switch
                      checked={emailSettings.tripUpdates}
                      onCheckedChange={() => handleEmailSettingChange("tripUpdates")}
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
                    <div>
                      <Label className="font-semibold text-white text-base">Trip Reminders</Label>
                      <p className="text-sm text-white/70 mt-1">Receive reminders about upcoming trips</p>
                    </div>
                    <Switch
                      checked={emailSettings.tripReminders}
                      onCheckedChange={() => handleEmailSettingChange("tripReminders")}
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
                    <div>
                      <Label className="font-semibold text-white text-base">New Features</Label>
                      <p className="text-sm text-white/70 mt-1">Be the first to know about new Planora features</p>
                    </div>
                    <Switch
                      checked={emailSettings.newFeatures}
                      onCheckedChange={() => handleEmailSettingChange("newFeatures")}
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
                    <div>
                      <Label className="font-semibold text-white text-base">Newsletter</Label>
                      <p className="text-sm text-white/70 mt-1">Monthly travel tips and destination highlights</p>
                    </div>
                    <Switch
                      checked={emailSettings.newsletter}
                      onCheckedChange={() => handleEmailSettingChange("newsletter")}
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
                    <div>
                      <Label className="font-semibold text-white text-base">Promotions & Deals</Label>
                      <p className="text-sm text-white/70 mt-1">Special offers and discounts on travel services</p>
                    </div>
                    <Switch
                      checked={emailSettings.promotions}
                      onCheckedChange={() => handleEmailSettingChange("promotions")}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* App Notifications */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full mr-4"></div>
              App Notifications
            </h2>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Card className="relative bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-400/30">
                      <Smartphone className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-xl">Push Notifications</CardTitle>
                      <CardDescription className="text-white/70">
                        Manage notifications that appear on your device
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
                    <div>
                      <Label className="font-semibold text-white text-base">Trip Updates</Label>
                      <p className="text-sm text-white/70 mt-1">Real-time updates about your travel plans</p>
                    </div>
                    <Switch
                      checked={appSettings.tripUpdates}
                      onCheckedChange={() => handleAppSettingChange("tripUpdates")}
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
                    <div>
                      <Label className="font-semibold text-white text-base">Price Alerts</Label>
                      <p className="text-sm text-white/70 mt-1">Get notified when flight or hotel prices change</p>
                    </div>
                    <Switch
                      checked={appSettings.priceAlerts}
                      onCheckedChange={() => handleAppSettingChange("priceAlerts")}
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
                    <div>
                      <Label className="font-semibold text-white text-base">Chat Responses</Label>
                      <p className="text-sm text-white/70 mt-1">Notifications when AI responds to your messages</p>
                    </div>
                    <Switch
                      checked={appSettings.chatResponses}
                      onCheckedChange={() => handleAppSettingChange("chatResponses")}
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
                    <div>
                      <Label className="font-semibold text-white text-base">Trip Reminders</Label>
                      <p className="text-sm text-white/70 mt-1">Reminders about upcoming departures and bookings</p>
                    </div>
                    <Switch
                      checked={appSettings.tripReminders}
                      onCheckedChange={() => handleAppSettingChange("tripReminders")}
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
                    <div>
                      <Label className="font-semibold text-white text-base">New Features</Label>
                      <p className="text-sm text-white/70 mt-1">Notifications about new app features and updates</p>
                    </div>
                    <Switch
                      checked={appSettings.newFeatures}
                      onCheckedChange={() => handleAppSettingChange("newFeatures")}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <Button 
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="border-white/30 bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-8 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Notifications };
