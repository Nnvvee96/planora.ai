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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DeleteAccountDialog,
  userProfileApi,
} from "@/features/user-profile/userProfileApi";
import { useAuth } from "@/features/auth/authApi";
import { capitalize } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ArrowLeft } from "lucide-react";
// Security-related imports removed as they're not used in current implementation

const PrivacySecurity = (): React.ReactNode => {
  const { user, refreshUser } = useAuth();
  
  const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(
    null,
  );
  const [_activeSessions, _setActiveSessions] = useState([]);
  const [_loading, _setLoading] = useState(true);

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    dataSharing: false,
    analytics: true,
    locationTracking: true,
    personalization: true,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    activityLog: true,
    deviceHistory: true,
  });

  // State for controlling the delete account dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Sample login history
  const loginHistory = [
    {
      device: "MacBook Pro (Current)",
      location: "San Francisco, CA",
      date: "Dec 28, 2024, 14:32",
      status: "Current",
    },
    {
      device: "iPhone 15 Pro",
      location: "San Francisco, CA", 
      date: "Dec 27, 2024, 09:15",
      status: "Success",
    },
    {
      device: "Unknown Device",
      location: "Berlin, Germany",
      date: "Apr 25, 2025, 03:17",
      status: "Blocked",
    },
  ];

  const handlePrivacySettingChange = (
    setting: keyof typeof privacySettings,
  ) => {
    setPrivacySettings({
      ...privacySettings,
      [setting]: !privacySettings[setting],
    });
  };

  const handleSecuritySettingChange = (
    setting: keyof typeof securitySettings,
  ) => {
    setSecuritySettings({
      ...securitySettings,
      [setting]: !securitySettings[setting],
    });
  };

  const handleSave = () => {
    toast({
      title: "Privacy & Security settings updated",
      description: "Your preferences have been saved.",
    });
  };

  const handleUnlink = async (provider: string) => {
    setUnlinkingProvider(provider);
    try {
      const { success, error } =
        await userProfileApi.unbindOAuthProvider(provider);

      if (success) {
        toast({
          title: "Account Unlinked",
          description: `Your ${capitalize(provider)} account has been successfully unlinked.`,
        });
        // Refresh user data to update the UI
        await refreshUser();
      } else {
        toast({
          title: "Error",
          description:
            error?.message ||
            `Failed to unlink ${capitalize(provider)} account. Please try again.`,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUnlinkingProvider(null);
    }
  };

  const _handleUnbind = async (provider: string) => {
    if (!user) return;
    const { success, error: _error } =
      await userProfileApi.unbindOAuthProvider(provider);
    if (success) {
      // Refresh sessions or show success message
    } else {
      // Show error message
    }
  };

  return (
    <>
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
                onClick={() => window.history.back()}
                className="shrink-0 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
              >
                <ArrowLeft className="h-8 w-8" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                  Privacy & Security
                </h1>
                <p className="text-white/60 mt-2">Manage your privacy settings and account security</p>
              </div>
            </div>

            {/* Privacy Settings */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full mr-4"></div>
                Privacy Settings
              </h2>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-75"></div>
                <Card className="relative bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white text-xl">Privacy Settings</CardTitle>
                    <CardDescription className="text-white/70">
                      Control how your data is used and shared
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
                      <div>
                        <Label className="font-semibold text-white text-base">
                          Data Sharing with Partners
                        </Label>
                        <p className="text-sm text-white/70 mt-1">
                          Allow us to share your data with trusted travel partners
                        </p>
                      </div>
                      <Switch
                        checked={privacySettings.dataSharing}
                        onCheckedChange={() =>
                          handlePrivacySettingChange("dataSharing")
                        }
                      />
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
                      <div>
                        <Label className="font-semibold text-white text-base">Analytics & Improvement</Label>
                        <p className="text-sm text-white/70 mt-1">
                          Help us improve Planora through usage analytics
                        </p>
                      </div>
                      <Switch
                        checked={privacySettings.analytics}
                        onCheckedChange={() =>
                          handlePrivacySettingChange("analytics")
                        }
                      />
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
                      <div>
                        <Label className="font-semibold text-white text-base">Location Tracking</Label>
                        <p className="text-sm text-white/70 mt-1">
                          Allow location-based features and recommendations
                        </p>
                      </div>
                      <Switch
                        checked={privacySettings.locationTracking}
                        onCheckedChange={() =>
                          handlePrivacySettingChange("locationTracking")
                        }
                      />
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
                      <div>
                        <Label className="font-semibold text-white text-base">Personalization</Label>
                        <p className="text-sm text-white/70 mt-1">
                          Allow us to personalize your experience based on your
                          preferences
                        </p>
                      </div>
                      <Switch
                        checked={privacySettings.personalization}
                        onCheckedChange={() =>
                          handlePrivacySettingChange("personalization")
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Security Settings */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full mr-4"></div>
                Security Settings
              </h2>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Card className="relative bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white text-xl">Security Settings</CardTitle>
                    <CardDescription className="text-white/70">
                      Protect your account with additional security measures
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
                      <div>
                        <Label className="font-semibold text-white text-base">
                          Two-Factor Authentication
                        </Label>
                        <p className="text-sm text-white/70 mt-1">
                          Require a verification code when logging in
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={securitySettings.twoFactorAuth}
                          onCheckedChange={() =>
                            handleSecuritySettingChange("twoFactorAuth")
                          }
                        />
                        {securitySettings.twoFactorAuth && (
                          <Button variant="outline" size="sm" className="border-white/30 bg-white/10 hover:bg-white/20 text-white">
                            Configure
                          </Button>
                        )}
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
                      <div>
                        <Label className="font-semibold text-white text-base">Activity Log</Label>
                        <p className="text-sm text-white/70 mt-1">
                          Record all activities on your account
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.activityLog}
                        onCheckedChange={() =>
                          handleSecuritySettingChange("activityLog")
                        }
                      />
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
                      <div>
                        <Label className="font-semibold text-white text-base">Device History</Label>
                        <p className="text-sm text-white/70 mt-1">
                          Track devices that have accessed your account
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.deviceHistory}
                        onCheckedChange={() =>
                          handleSecuritySettingChange("deviceHistory")
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Linked Accounts */}
            {user &&
              user.app_metadata.providers &&
              user.app_metadata.providers.length > 1 && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-full mr-4"></div>
                    Linked Accounts
                  </h2>
                  
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Card className="relative bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl transition-all duration-300">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-white text-xl">Linked Accounts</CardTitle>
                        <CardDescription className="text-white/70">
                          Manage your connected social accounts
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {user.app_metadata.providers
                          .filter((p) => p !== "email")
                          .map((provider) => (
                            <div
                              key={provider}
                              className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10"
                            >
                              <div>
                                <Label className="font-semibold text-white text-base">
                                  {capitalize(provider)}
                                </Label>
                                <p className="text-sm text-white/70 mt-1">
                                  Connected as {user.user_metadata.email}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => handleUnlink(provider)}
                                disabled={unlinkingProvider === provider}
                                className="border-white/30 bg-white/10 hover:bg-white/20 text-white"
                              >
                                {unlinkingProvider === provider ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Unlink
                              </Button>
                            </div>
                          ))}
                      </CardContent>
                    </Card>
                  </div>
                </section>
              )}

            {/* Login History */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-orange-400 to-red-400 rounded-full mr-4"></div>
                Login History
              </h2>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Card className="relative bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white text-xl">Login History</CardTitle>
                    <CardDescription className="text-white/70">
                      Recent login activities on your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableHead className="text-white/80 font-semibold">Device</TableHead>
                          <TableHead className="text-white/80 font-semibold">Location</TableHead>
                          <TableHead className="text-white/80 font-semibold">Date & Time</TableHead>
                          <TableHead className="text-white/80 font-semibold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loginHistory.map((login, index) => (
                          <TableRow key={index} className="border-white/10 hover:bg-white/5">
                            <TableCell className="text-white/90">{login.device}</TableCell>
                            <TableCell className="text-white/90">{login.location}</TableCell>
                            <TableCell className="text-white/90">{login.date}</TableCell>
                            <TableCell>
                              {login.status === "Current" ? (
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-sm font-medium">
                                  Current Session
                                </span>
                              ) : login.status === "Success" ? (
                                <span className="text-white/60 text-sm">
                                  Successful
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-sm font-medium">
                                  Blocked
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-red-400 mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-red-400 to-red-600 rounded-full mr-4"></div>
                Danger Zone
              </h2>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Card className="relative bg-black/30 backdrop-blur-xl border border-red-500/30 rounded-2xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-red-400 text-xl">Danger Zone</CardTitle>
                    <CardDescription className="text-white/70">
                      These actions are permanent and cannot be undone.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center p-4 bg-red-500/5 rounded-xl border border-red-500/20 transition-all duration-300 hover:bg-red-500/10">
                      <div>
                        <Label className="font-semibold text-white text-base">Delete Account</Label>
                        <p className="text-sm text-white/70 mt-1">
                          Permanently delete your account and all of your content.
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 hover:text-red-300"
                      >
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Save and Back Buttons */}
            <div className="flex justify-center gap-4 mb-8">
              <Button 
                onClick={() => window.location.href = "/dashboard"}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
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
      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
};

export { PrivacySecurity };
