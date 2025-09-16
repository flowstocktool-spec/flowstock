import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, User, Key, Save } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    username: 'john_seller',
    email: 'john@example.com',
    senderEmail: 'alerts@mystore.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSave = (section: string) => {
    console.log(`Save ${section} settings triggered:`, settings);
  };

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" data-testid="heading-settings">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Profile Settings */}
        <Card data-testid="card-profile-settings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={settings.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                data-testid="input-username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                data-testid="input-email"
              />
            </div>

            <Button 
              onClick={() => handleSave('profile')}
              data-testid="button-save-profile"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card data-testid="card-email-settings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senderEmail">Sender Email Address</Label>
              <Input
                id="senderEmail"
                type="email"
                placeholder="alerts@yourstore.com"
                value={settings.senderEmail}
                onChange={(e) => handleInputChange('senderEmail', e.target.value)}
                data-testid="input-sender-email"
              />
              <p className="text-sm text-muted-foreground">
                This email address will be used as the sender for all supplier notifications
              </p>
            </div>

            <Button 
              onClick={() => handleSave('email')}
              data-testid="button-save-email"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Email Settings
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card data-testid="card-security-settings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={settings.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                data-testid="input-current-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={settings.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                data-testid="input-new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={settings.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                data-testid="input-confirm-password"
              />
            </div>

            <Button 
              onClick={() => handleSave('security')}
              data-testid="button-save-security"
            >
              <Save className="mr-2 h-4 w-4" />
              Update Password
            </Button>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card data-testid="card-appearance-settings">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}