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
import { ProfileSettingsForm } from "./settings/ProfileSettingsForm";
import { AISettingsForm } from "./settings/AISettingsForm";
import { AppearanceSettingsForm } from "./settings/AppearanceSettingsForm";
import { NotificationsSettingsForm } from "./settings/NotificationsSettingsForm";
import { PrivacySettingsForm } from "./settings/PrivacySettingsForm";

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

  // 新增：工作偏好/时间相关字段
  const [workStartTime, setWorkStartTime] = useState<string>('09:00');
  const [workEndTime, setWorkEndTime] = useState<string>('18:00');
  const [focusDuration, setFocusDuration] = useState<number>(45);
  const [breakDuration, setBreakDuration] = useState<number>(15);
  const [bufferMinutes, setBufferMinutes] = useState<number>(10);

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
          // 初始化：工作偏好字段
          setWorkStartTime(profileData.work_start_time ? profileData.work_start_time.substring(0,5) : '09:00');
          setWorkEndTime(profileData.work_end_time ? profileData.work_end_time.substring(0,5) : '18:00');
          setFocusDuration(profileData.focus_duration_minutes || 45);
          setBreakDuration(profileData.break_duration_minutes || 15);
          setBufferMinutes(profileData.planning_buffer_minutes || 10);
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

  // 保存用户档案，包括工作偏好
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const updatedProfile = await profileService.updateProfile({
        timezone: selectedTimeZone,
        ai_model: selectedModel,
        ai_base_url: baseUrl,
        ai_api_key: apiKey,
        work_start_time: workStartTime + ':00+08', // 转化为 time with tz 格式
        work_end_time: workEndTime + ':00+08',
        focus_duration_minutes: focusDuration,
        break_duration_minutes: breakDuration,
        planning_buffer_minutes: bufferMinutes
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Button onClick={handleSaveProfile} className="bg-green-500 hover:bg-green-600" disabled={isLoadingProfile || isSavingProfile}>
          <Save className="w-4 h-4 mr-2" />
          {isSavingProfile ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
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
                管理你的个人信息和工作偏好
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProfileSettingsForm
                profile={profile}
                workStartTime={workStartTime}
                setWorkStartTime={setWorkStartTime}
                workEndTime={workEndTime}
                setWorkEndTime={setWorkEndTime}
                focusDuration={focusDuration}
                setFocusDuration={setFocusDuration}
                breakDuration={breakDuration}
                setBreakDuration={setBreakDuration}
                bufferMinutes={bufferMinutes}
                setBufferMinutes={setBufferMinutes}
                selectedTimeZone={selectedTimeZone}
                setSelectedTimeZone={setSelectedTimeZone}
                timeZoneOptions={timeZoneOptions}
                isLoadingProfile={isLoadingProfile}
                handleSaveProfile={handleSaveProfile}
                isSavingProfile={isSavingProfile}
              />
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
              <AISettingsForm
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                baseUrl={baseUrl}
                setBaseUrl={setBaseUrl}
                apiKey={apiKey}
                setApiKey={setApiKey}
              />
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
              <AppearanceSettingsForm darkMode={darkMode} setDarkMode={setDarkMode} />
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
              <NotificationsSettingsForm
                notifications={notifications}
                setNotifications={setNotifications}
              />
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
              <PrivacySettingsForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
