
import React, { useState, useEffect } from 'react';
import { profileService, Profile } from '@/services/profileService';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Brain, Palette, Bell, Shield, UserCircle } from "lucide-react"; // Added UserCircle

export const SettingsView = () => {
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Profile specific state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedTimeZone, setSelectedTimeZone] = useState<string>('');
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true); // Renamed to avoid conflict
  const { toast } = useToast();

  // Generate time zone options using Intl API
  const timeZoneOptions = React.useMemo(() => {
    try {
      return Intl.supportedValuesOf('timeZone').map(tz => ({ value: tz, label: tz }));
    } catch (e) {
      // Fallback for environments where Intl.supportedValuesOf is not available (e.g. older Node for SSR)
      console.warn("Intl.supportedValuesOf('timeZone') is not supported, using a fallback list.");
      return [
        { value: 'UTC', label: 'UTC' },
        { value: 'America/New_York', label: 'America/New York' },
        { value: 'America/Chicago', label: 'America/Chicago' },
        { value: 'America/Denver', label: 'America/Denver' },
        { value: 'America/Los_Angeles', label: 'America/Los Angeles' },
        { value: 'Europe/London', label: 'Europe/London' },
        { value: 'Europe/Berlin', label: 'Europe/Berlin' },
        { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
        { value: 'Asia/Shanghai', label: 'Asia/Shanghai' },
        { value: 'Australia/Sydney', label: 'Australia/Sydney' },
      ];
    }
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoadingProfile(true);
      try {
        const profileData = await profileService.getProfile();
        if (profileData) {
          setProfile(profileData);
          setSelectedTimeZone(profileData.timezone || '');
        } else {
          toast({ title: 'Profile Not Found', description: 'Could not load user profile.', variant: 'warning' });
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load profile data.', variant: 'destructive' });
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfileData();
  }, [toast]);

  const handleSaveGeneralSettings = () => {
    // Handle save for general settings (AI, Appearance etc.)
    console.log("General settings saved:", { baseUrl, apiKey, selectedModel, notifications, darkMode });
    toast({ title: 'General Settings Saved', description: 'AI, Appearance, and other settings have been saved.'});
  };

  const handleSaveProfile = async () => {
    if (!profile) {
      toast({ title: 'Error', description: 'Profile not loaded.', variant: 'destructive' });
      return;
    }
    setIsLoadingProfile(true);
    try {
      await profileService.updateProfile({ timezone: selectedTimeZone });
      setProfile(prev => prev ? { ...prev, timezone: selectedTimeZone, updated_at: new Date() } : null);
      toast({ title: 'Success', description: 'Profile updated successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
      console.error("Error updating profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Settings</h1>
        {/* This button could be made context-aware based on the active tab or removed if each tab has its own save */}
        <Button onClick={handleSaveGeneralSettings} className="bg-green-500 hover:bg-green-600">
          <Save className="w-4 h-4 mr-2" />
          Save General Settings
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6"> {/* Changed default to profile */}
        <TabsList className="grid w-full grid-cols-5"> {/* Adjusted grid columns for new tab */}
          <TabsTrigger value="profile">Profile</TabsTrigger> {/* New Profile Tab */}
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="w-5 h-5" />
                User Profile
              </CardTitle>
              <CardDescription>
                Manage your profile settings, including time zone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={profile?.full_name || ''} disabled placeholder="Loading..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={profile?.email || ''} disabled placeholder="Loading..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone-select">Time Zone</Label>
                <Select
                  value={selectedTimeZone}
                  onValueChange={setSelectedTimeZone}
                  disabled={isLoadingProfile}
                >
                  <SelectTrigger id="timezone-select">
                    <SelectValue placeholder="Select your time zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeZoneOptions.map(tz => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 <p className="text-sm text-muted-foreground">
                  Select your local time zone for accurate scheduling and reminders.
                </p>
              </div>
              <Button onClick={handleSaveProfile} disabled={isLoadingProfile}>
                {isLoadingProfile ? 'Saving Profile...' : 'Save Profile Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Configuration
              </CardTitle>
              <CardDescription>
                Configure AI model settings for task assistance and planning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3">Claude 3</SelectItem>
                    <SelectItem value="local-model">Local Model</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseUrl">Custom Base URL (Optional)</Label>
                <Input
                  id="baseUrl"
                  type="url"
                  placeholder="https://api.example.com/v1"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty to use default endpoint
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                   Your API key is stored securely and encrypted.
                </p>
              </div>

               {/* Separator and AI Features remain as they were, no changes needed here for profile */}
              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">AI Features</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Task Breakdown</p>
                       <p className="text-sm text-muted-foreground">Let AI break down complex tasks.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Smart Scheduling</p>
                       <p className="text-sm text-muted-foreground">AI-powered schedule planning.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Energy Prediction</p>
                       <p className="text-sm text-muted-foreground">Predict and track energy levels.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Toggle dark theme</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Theme Color</Label>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded-md border-2 border-green-600 cursor-pointer"></div>
                  <div className="w-8 h-8 bg-blue-500 rounded-md border cursor-pointer"></div>
                  <div className="w-8 h-8 bg-purple-500 rounded-md border cursor-pointer"></div>
                  <div className="w-8 h-8 bg-orange-500 rounded-md border cursor-pointer"></div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontSize">Font Size</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="density">Display Density</Label>
                <Select defaultValue="comfortable">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage when and how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive push notifications</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Notification Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Task Reminders</p>
                      <p className="text-sm text-muted-foreground">Notify before task deadlines</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Daily Summary</p>
                      <p className="text-sm text-muted-foreground">Daily progress recap</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">AI Suggestions</p>
                      <p className="text-sm text-muted-foreground">AI-powered productivity tips</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Quiet Hours</Label>
                <div className="flex gap-2">
                  <Input type="time" defaultValue="22:00" className="flex-1" />
                  <span className="self-center text-sm text-muted-foreground">to</span>
                  <Input type="time" defaultValue="08:00" className="flex-1" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No notifications during these hours
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Control your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Data Collection</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Analytics</p>
                      <p className="text-sm text-muted-foreground">Help improve the app with usage data</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Error Reporting</p>
                      <p className="text-sm text-muted-foreground">Automatically report crashes and errors</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Data Management</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Export All Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Download Privacy Report
                  </Button>
                  <Button variant="destructive" className="w-full justify-start">
                    Delete All Data
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Data Retention</Label>
                <Select defaultValue="1year">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30days">30 Days</SelectItem>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  How long to keep completed tasks and analytics data
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
