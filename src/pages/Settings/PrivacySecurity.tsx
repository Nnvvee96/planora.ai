
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PrivacySecurity: React.FC = () => {
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    dataSharing: false,
    analytics: true,
    locationTracking: false,
    personalization: true
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    activityLog: true,
    deviceHistory: true
  });

  // Sample login history
  const loginHistory = [
    { device: "Windows PC", location: "Paris, France", date: "May 2, 2025, 14:23", status: "Current" },
    { device: "iPhone 16", location: "Paris, France", date: "May 1, 2025, 10:15", status: "Success" },
    { device: "MacBook Pro", location: "Lyon, France", date: "Apr 28, 2025, 19:42", status: "Success" },
    { device: "Unknown Device", location: "Berlin, Germany", date: "Apr 25, 2025, 03:17", status: "Blocked" }
  ];

  const handlePrivacySettingChange = (setting: keyof typeof privacySettings) => {
    setPrivacySettings({
      ...privacySettings,
      [setting]: !privacySettings[setting]
    });
  };

  const handleSecuritySettingChange = (setting: keyof typeof securitySettings) => {
    setSecuritySettings({
      ...securitySettings,
      [setting]: !securitySettings[setting]
    });
  };

  const handleSave = () => {
    toast({
      title: "Privacy & Security settings updated",
      description: "Your preferences have been saved."
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Privacy & Security</h1>
        
        {/* Privacy Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>Control how your data is used and shared</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Label className="font-medium">Data Sharing with Partners</Label>
                <p className="text-sm text-muted-foreground">Allow us to share your data with trusted travel partners</p>
              </div>
              <Switch 
                checked={privacySettings.dataSharing} 
                onCheckedChange={() => handlePrivacySettingChange('dataSharing')} 
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div>
                <Label className="font-medium">Analytics & Improvement</Label>
                <p className="text-sm text-muted-foreground">Help us improve Planora through usage analytics</p>
              </div>
              <Switch 
                checked={privacySettings.analytics} 
                onCheckedChange={() => handlePrivacySettingChange('analytics')} 
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div>
                <Label className="font-medium">Location Tracking</Label>
                <p className="text-sm text-muted-foreground">Allow location-based features and recommendations</p>
              </div>
              <Switch 
                checked={privacySettings.locationTracking} 
                onCheckedChange={() => handlePrivacySettingChange('locationTracking')} 
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div>
                <Label className="font-medium">Personalization</Label>
                <p className="text-sm text-muted-foreground">Allow us to personalize your experience based on your preferences</p>
              </div>
              <Switch 
                checked={privacySettings.personalization} 
                onCheckedChange={() => handlePrivacySettingChange('personalization')} 
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Security Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Protect your account with additional security measures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Label className="font-medium">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Require a verification code when logging in</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={securitySettings.twoFactorAuth} 
                  onCheckedChange={() => handleSecuritySettingChange('twoFactorAuth')} 
                />
                {securitySettings.twoFactorAuth && (
                  <Button variant="outline" size="sm">Configure</Button>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div>
                <Label className="font-medium">Activity Log</Label>
                <p className="text-sm text-muted-foreground">Record all activities on your account</p>
              </div>
              <Switch 
                checked={securitySettings.activityLog} 
                onCheckedChange={() => handleSecuritySettingChange('activityLog')} 
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div>
                <Label className="font-medium">Device History</Label>
                <p className="text-sm text-muted-foreground">Track devices that have accessed your account</p>
              </div>
              <Switch 
                checked={securitySettings.deviceHistory} 
                onCheckedChange={() => handleSecuritySettingChange('deviceHistory')} 
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Login History */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Login History</CardTitle>
            <CardDescription>Recent login activities on your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginHistory.map((login, index) => (
                  <TableRow key={index}>
                    <TableCell>{login.device}</TableCell>
                    <TableCell>{login.location}</TableCell>
                    <TableCell>{login.date}</TableCell>
                    <TableCell>
                      {login.status === "Current" ? (
                        <span className="text-green-500 font-medium">Current Session</span>
                      ) : login.status === "Success" ? (
                        <span className="text-muted-foreground">Successful</span>
                      ) : (
                        <span className="text-red-500 font-medium">Blocked</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacySecurity;
