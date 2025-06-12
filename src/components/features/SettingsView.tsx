import React, { useState, useEffect } from 'react';
import { profileService, Profile } from '@/services/profileService';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Brain, Palette, Bell, Shield, UserCircle } from "lucide-react";
import { getUserTimezone } from '@/utils/timezoneUtils';

export const SettingsView = () => {
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-flash-preview-05-20");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Profile specific state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedTimeZone, setSelectedTimeZone] = useState<string>('');
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const { toast } = useToast();

  // Generate time zone options with fallback for older environments
  const timeZoneOptions = React.useMemo(() => {
    const userTimezone = getUserTimezone();
    
    // Try to use Intl.supportedValuesOf if available, otherwise use fallback list
    let zones: { value: string; label: string }[] = [];
    
    try {
      // Check if supportedValuesOf is available
      if ('supportedValuesOf' in Intl && typeof (Intl as any).supportedValuesOf === 'function') {
        zones = (Intl as any).supportedValuesOf('timeZone').map((tz: string) => ({ 
          value: tz, 
          label: tz.replace(/_/g, ' ')
        }));
      } else {
        throw new Error('supportedValuesOf not available');
      }
    } catch (e) {
      // Fallback for environments where Intl.supportedValuesOf is not available
      console.warn("Intl.supportedValuesOf('timeZone') is not supported, using a fallback list.");
      zones = [
        { value: 'UTC', label: 'UTC' },
        { value: 'America/New_York', label: 'America/New York' },
        { value: 'America/Chicago', label: 'America/Chicago' },
        { value: 'America/Denver', label: 'America/Denver' },
        { value: 'America/Los_Angeles', label: 'America/Los Angeles' },
        { value: 'America/Toronto', label: 'America/Toronto' },
        { value: 'America/Vancouver', label: 'America/Vancouver' },
        { value: 'Europe/London', label: 'Europe/London' },
        { value: 'Europe/Berlin', label: 'Europe/Berlin' },
        { value: 'Europe/Paris', label: 'Europe/Paris' },
        { value: 'Europe/Rome', label: 'Europe/Rome' },
        { value: 'Europe/Madrid', label: 'Europe/Madrid' },
        { value: 'Europe/Amsterdam', label: 'Europe/Amsterdam' },
        { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
        { value: 'Asia/Shanghai', label: 'Asia/Shanghai' },
        { value: 'Asia/Hong_Kong', label: 'Asia/Hong Kong' },
        { value: 'Asia/Singapore', label: 'Asia/Singapore' },
        { value: 'Asia/Seoul', label: 'Asia/Seoul' },
        { value: 'Asia/Mumbai', label: 'Asia/Mumbai' },
        { value: 'Asia/Dubai', label: 'Asia/Dubai' },
        { value: 'Australia/Sydney', label: 'Australia/Sydney' },
        { value: 'Australia/Melbourne', label: 'Australia/Melbourne' },
        { value: 'Australia/Perth', label: 'Australia/Perth' },
        { value: 'Pacific/Auckland', label: 'Pacific/Auckland' },
        { value: 'Africa/Cairo', label: 'Africa/Cairo' },
        { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg' },
        { value: 'America/Sao_Paulo', label: 'America/Sao Paulo' },
        { value: 'America/Mexico_City', label: 'America/Mexico City' },
        { value: 'America/Argentina/Buenos_Aires', label: 'America/Argentina/Buenos Aires' },
      ];
    }
    
    // Sort with user's current timezone first
    return zones.sort((a, b) => {
      if (a.value === userTimezone) return -1;
      if (b.value === userTimezone) return 1;
      return a.label.localeCompare(b.label);
    });
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoadingProfile(true);
      try {
        const profileData = await profileService.getProfile();
        if (profileData) {
          setProfile(profileData);
          setSelectedTimeZone(profileData.timezone || getUserTimezone());
          setSelectedModel(profileData.ai_model || "gemini-flash-preview-05-20");
          setBaseUrl(profileData.ai_base_url || "");
          setApiKey(profileData.ai_api_key || "");
        } else {
          // Set default timezone if no profile
          setSelectedTimeZone(getUserTimezone());
          toast({ 
            title: 'Profile Not Found', 
            description: 'A new profile will be created when you save your settings.', 
            variant: 'default' 
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setSelectedTimeZone(getUserTimezone());
        toast({ 
          title: 'Error', 
          description: 'Failed to load profile data. Using default settings.', 
          variant: 'destructive' 
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfileData();
  }, [toast]);

  const handleSaveGeneralSettings = async () => {
    setIsSavingProfile(true);
    try {
      const updatedProfile = await profileService.updateProfile({
        timezone: selectedTimeZone,
        ai_model: selectedModel,
        ai_base_url: baseUrl,
        ai_api_key: apiKey,
      });
      if (updatedProfile) {
        setProfile(updatedProfile);
        toast({
          title: 'Success',
          description: 'General settings saved successfully.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error("Error saving general settings:", error);
      toast({
        title: 'Error',
        description: 'Failed to save general settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const updatedProfile = await profileService.updateProfile({ 
        timezone: selectedTimeZone,
        ai_model: selectedModel,
        ai_base_url: baseUrl,
        ai_api_key: apiKey
      });
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        toast({ 
          title: 'Success', 
          description: 'Profile updated successfully.',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ 
        title: 'Error', 
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive' 
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-semibold">Settings</h1>
        {/* This button could be made context-aware based on the active tab or removed if each tab has its own save */}
        <Button onClick={handleSaveGeneralSettings} className="bg-green-500 hover:bg-green-600 w-full sm:w-auto text-xs sm:text-sm">
          <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Save General Settings
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex items-center justify-start w-max min-w-full"> {/* Use flex for natural width and scrolling */}
            <TabsTrigger value="profile" className="text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5">Profile</TabsTrigger>
            <TabsTrigger value="ai" className="text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5">AI Settings</TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5">Appearance</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5">Notifications</TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5">Privacy</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                <UserCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                User Profile
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage your profile settings, including time zone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="fullName" className="text-xs sm:text-sm">Full Name</Label>
                <Input id="fullName" value={profile?.full_name || ''} disabled placeholder="Loading..." className="text-xs sm:text-sm"/>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                <Input id="email" type="email" value={profile?.email || ''} disabled placeholder="Loading..." className="text-xs sm:text-sm"/>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="timezone-select" className="text-xs sm:text-sm">Time Zone</Label>
                <select
                  id="timezone-select"
                  className="w-full border rounded px-3 py-2 text-xs sm:text-sm bg-background"
                  value={selectedTimeZone}
                  onChange={e => setSelectedTimeZone(e.target.value)}
                  disabled={isLoadingProfile}
                >
                  <option value="" disabled>Select your time zone</option>
                  {timeZoneOptions.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Select your local time zone for accurate scheduling and reminders.
                </p>
              </div>
              <Button onClick={handleSaveProfile} disabled={isLoadingProfile || isSavingProfile} size="sm" className="text-xs sm:text-sm">
                {isSavingProfile ? 'Saving Profile...' : 'Save Profile Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                AI Configuration
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Configure AI model settings for task assistance and planning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="model" className="text-xs sm:text-sm">AI Model</Label>
                {/* The line above this comment was the duplicated <Input /> tag */}
                <Input
                  id="model"
                  type="text"
                  placeholder="e.g. gemini-flash-preview-05-20, gpt-4, llama-3, etc."
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  className="text-xs sm:text-sm"
                />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Enter any model name supported by your provider. Default: gemini-flash-preview-05-20
                </p>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="baseUrl" className="text-xs sm:text-sm">OpenAI-Compatible Base URL (Optional)</Label>
                <Input
                  id="baseUrl"
                  type="url"
                  placeholder="https://api.openai.com/v1 or your custom endpoint"
                  value={baseUrl}
                  onChange={e => setBaseUrl(e.target.value)}
                  className="text-xs sm:text-sm"
                />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Leave empty to use the default endpoint. For custom providers, enter their OpenAI-compatible API base URL.
                </p>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="apiKey" className="text-xs sm:text-sm">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="text-xs sm:text-sm"
                />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Your API key is stored securely and encrypted.
                </p>
              </div>

              <Separator />

              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-medium">AI Features</h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <div>
                      <p className="text-xs sm:text-sm font-medium">Task Breakdown</p>
                      <p className="text-xs text-muted-foreground">Let AI break down complex tasks.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <div>
                      <p className="text-xs sm:text-sm font-medium">Smart Scheduling</p>
                      <p className="text-xs text-muted-foreground">AI-powered schedule planning.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <div>
                      <p className="text-xs sm:text-sm font-medium">Energy Prediction</p>
                      <p className="text-xs text-muted-foreground">Predict and track energy levels.</p>
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
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                Appearance
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Customize the look and feel of your workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <div>
                  <p className="text-xs sm:text-sm font-medium">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Toggle dark theme</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>

              <Separator />

              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Theme Color</Label>
                <div className="flex gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-md border-2 border-green-600 cursor-pointer"></div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-md border cursor-pointer"></div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-500 rounded-md border cursor-pointer"></div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-500 rounded-md border cursor-pointer"></div>
                </div>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="fontSize" className="text-xs sm:text-sm">Font Size</Label>
                <select
                  id="fontSize"
                  className="w-full border rounded px-3 py-2 text-xs sm:text-sm bg-background"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="density" className="text-xs sm:text-sm">Display Density</Label>
                <select
                  id="density"
                  className="w-full border rounded px-3 py-2 text-xs sm:text-sm bg-background"
                >
                  <option value="compact">Compact</option>
                  <option value="comfortable">Comfortable</option>
                  <option value="spacious">Spacious</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                Notifications
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage when and how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <div>
                  <p className="text-xs sm:text-sm font-medium">Enable Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive push notifications</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <Separator />

              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-medium">Notification Types</h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <div>
                      <p className="text-xs sm:text-sm font-medium">Task Reminders</p>
                      <p className="text-xs text-muted-foreground">Notify before task deadlines</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <div>
                      <p className="text-xs sm:text-sm font-medium">Daily Summary</p>
                      <p className="text-xs text-muted-foreground">Daily progress recap</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <div>
                      <p className="text-xs sm:text-sm font-medium">AI Suggestions</p>
                      <p className="text-xs text-muted-foreground">AI-powered productivity tips</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Quiet Hours</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input type="time" defaultValue="22:00" className="flex-1 text-xs sm:text-sm" />
                  <span className="self-center text-xs sm:text-sm text-muted-foreground hidden sm:block">to</span>
                  <Input type="time" defaultValue="08:00" className="flex-1 text-xs sm:text-sm" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  No notifications during these hours
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Control your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-medium">Data Collection</h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <div>
                      <p className="text-xs sm:text-sm font-medium">Analytics</p>
                      <p className="text-xs text-muted-foreground">Help improve the app with usage data</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <div>
                      <p className="text-xs sm:text-sm font-medium">Error Reporting</p>
                      <p className="text-xs text-muted-foreground">Automatically report crashes and errors</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-medium">Data Management</h4>
                <div className="space-y-1.5 sm:space-y-2">
                  <Button variant="outline" className="w-full justify-start text-xs sm:text-sm">
                    Export All Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-xs sm:text-sm">
                    Download Privacy Report
                  </Button>
                  <Button variant="destructive" className="w-full justify-start text-xs sm:text-sm">
                    Delete All Data
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Data Retention</Label>
                <select
                  id="dataRetention"
                  className="w-full border rounded px-3 py-2 text-xs sm:text-sm bg-background"
                >
                  <option value="30days">30 Days</option>
                  <option value="6months">6 Months</option>
                  <option value="1year">1 Year</option>
                  <option value="forever">Forever</option>
                </select>
                <p className="text-xs sm:text-sm text-muted-foreground">
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