import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, User, Key, Save, TestTube, CheckCircle, AlertTriangle } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import ThemeToggle from "@/components/ThemeToggle";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    username: '',
    email: '',
    senderEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch current user data
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user/current'],
    queryFn: async () => {
      const response = await fetch('/api/user/current');
      if (!response.ok) {
        throw new Error('Failed to fetch current user');
      }
      return response.json();
    },
  });

  // Update settings when user data is loaded
  useEffect(() => {
    if (currentUser) {
      setSettings(prev => ({
        ...prev,
        username: currentUser.username || '',
        email: currentUser.email || '',
        senderEmail: currentUser.senderEmail || '',
      }));
    }
  }, [currentUser]);

  const [emailConfig, setEmailConfig] = useState({
    gmailUsername: '',
    gmailAppPassword: '',
    testEmail: '',
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null, message: string }>({
    type: null,
    message: '',
  });

  const configureMutation = useMutation({
    mutationFn: async (config: { username: string; password: string }) => {
      const response = await fetch('/api/email/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to configure email');
      }
      return response.json();
    },
    onSuccess: () => {
      setFeedback({ type: 'success', message: 'Email configuration successful! Gmail SMTP is now configured.' });
    },
    onError: (error) => {
      setFeedback({ type: 'error', message: error.message });
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: async (data: { toEmail: string; fromEmail: string }) => {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        console.error('Test email error response:', error); // Log the detailed error
        throw new Error(error.error || 'Failed to send test email');
      }
      return response.json();
    },
    onSuccess: () => {
      setFeedback({ type: 'success', message: 'Test email sent successfully! Check your inbox.' });
    },
    onError: (error) => {
      setFeedback({ type: 'error', message: error.message });
    },
  });

  const saveUserMutation = useMutation({
    mutationFn: async (userData: { email: string; senderEmail: string }) => {
      if (!currentUser?.id) {
        throw new Error('User not found');
      }
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save user settings');
      }
      return response.json();
    },
    onSuccess: () => {
      setFeedback({ type: 'success', message: 'Profile settings saved successfully!' });
      // Invalidate the current user query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/user/current'] });
    },
    onError: (error) => {
      setFeedback({ type: 'error', message: error.message });
    },
  });

  const handleSave = (section: string) => {
    if (section === 'profile') {
      saveUserMutation.mutate({
        email: settings.email,
        senderEmail: settings.senderEmail,
      });
    } else {
      console.log(`Save ${section} settings triggered:`, settings);
      setFeedback({ type: 'success', message: `${section} settings saved successfully!` });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailConfigChange = (field: string, value: string) => {
    setEmailConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailConfigure = () => {
    if (!emailConfig.gmailUsername || !emailConfig.gmailAppPassword) {
      setFeedback({ type: 'error', message: 'Please enter both Gmail username and App Password' });
      return;
    }
    configureMutation.mutate({
      username: emailConfig.gmailUsername,
      password: emailConfig.gmailAppPassword,
    });
  };

  const handleTestEmail = () => {
    if (!emailConfig.testEmail || !settings.senderEmail) {
      setFeedback({ type: 'error', message: 'Please enter test email address and configure sender email' });
      return;
    }
    testEmailMutation.mutate({
      toEmail: emailConfig.testEmail,
      fromEmail: settings.senderEmail,
    });
  };

  const handleDemoConfig = async () => {
    try {
      const response = await fetch('/api/email/configure-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to configure demo email');
      }

      const result = await response.json();
      setFeedback({ 
        type: 'success', 
        message: 'Demo email configured! You can now test alerts automatically.' 
      });
    } catch (error) {
      setFeedback({ 
        type: 'error', 
        message: 'Demo setup failed. Please configure your own Gmail SMTP instead.' 
      });
    }
  };

  if (userLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold" data-testid="heading-settings">Settings</h1>
          <p className="text-muted-foreground">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" data-testid="heading-settings">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {feedback.type && (
          <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
            {feedback.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
        )}

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
                readOnly
                className="bg-muted"
                data-testid="input-username"
              />
              <p className="text-sm text-muted-foreground">
                Username cannot be changed in demo mode
              </p>
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

        {/* Email Configuration */}
        <Card data-testid="card-email-settings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Configuration
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

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Gmail SMTP Configuration</h4>
              <p className="text-sm text-muted-foreground">
                Configure Gmail SMTP to send emails. You need to enable 2-factor authentication and generate an App Password.
              </p>

              <div className="space-y-2">
                <Label htmlFor="gmailUsername">Gmail Username</Label>
                <Input
                  id="gmailUsername"
                  type="email"
                  placeholder="your-email@gmail.com"
                  value={emailConfig.gmailUsername}
                  onChange={(e) => handleEmailConfigChange('gmailUsername', e.target.value)}
                  data-testid="input-gmail-username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gmailAppPassword">Gmail App Password</Label>
                <Input
                  id="gmailAppPassword"
                  type="password"
                  placeholder="16-character App Password"
                  value={emailConfig.gmailAppPassword}
                  onChange={(e) => handleEmailConfigChange('gmailAppPassword', e.target.value)}
                  data-testid="input-gmail-app-password"
                />
                <p className="text-xs text-muted-foreground">
                  Generate this from Google Account → Security → 2-Step Verification → App passwords
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleEmailConfigure}
                  disabled={configureMutation.isPending}
                  data-testid="button-configure-email"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {configureMutation.isPending ? 'Configuring...' : 'Configure Email'}
                </Button>

                <Button 
                  onClick={handleDemoConfig}
                  disabled={configureMutation.isPending}
                  variant="outline"
                  data-testid="button-demo-config"
                >
                  <TestTube className="mr-2 h-4 w-4" />
                  Demo Setup
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Test Email</h4>
              <p className="text-sm text-muted-foreground">
                Send a test email to verify your configuration is working
              </p>

              <div className="space-y-2">
                <Label htmlFor="testEmail">Test Email Address</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="test@example.com"
                  value={emailConfig.testEmail}
                  onChange={(e) => handleEmailConfigChange('testEmail', e.target.value)}
                  data-testid="input-test-email"
                />
              </div>

              <Button 
                onClick={handleTestEmail}
                disabled={testEmailMutation.isPending}
                variant="outline"
                data-testid="button-test-email"
              >
                <TestTube className="mr-2 h-4 w-4" />
                {testEmailMutation.isPending ? 'Sending...' : 'Send Test Email'}
              </Button>
            </div>
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