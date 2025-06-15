
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Profile } from "@/services/profileService";

type ProfileSettingsFormProps = {
  profile: Profile | null;
  workStartTime: string;
  setWorkStartTime: (val: string) => void;
  workEndTime: string;
  setWorkEndTime: (val: string) => void;
  focusDuration: number;
  setFocusDuration: (val: number) => void;
  breakDuration: number;
  setBreakDuration: (val: number) => void;
  bufferMinutes: number;
  setBufferMinutes: (val: number) => void;
  selectedTimeZone: string;
  setSelectedTimeZone: (val: string) => void;
  timeZoneOptions: { value: string; label: string }[];
  isLoadingProfile: boolean;
  handleSaveProfile: () => void;
  isSavingProfile: boolean;
};

export function ProfileSettingsForm({
  profile,
  workStartTime,
  setWorkStartTime,
  workEndTime,
  setWorkEndTime,
  focusDuration,
  setFocusDuration,
  breakDuration,
  setBreakDuration,
  bufferMinutes,
  setBufferMinutes,
  selectedTimeZone,
  setSelectedTimeZone,
  timeZoneOptions,
  isLoadingProfile,
  handleSaveProfile,
  isSavingProfile,
}: ProfileSettingsFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" value={profile?.full_name || ''} disabled placeholder="Loading..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={profile?.email || ''} disabled placeholder="Loading..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="timezone-select">时区</Label>
        <select
          id="timezone-select"
          className="w-full border rounded px-3 py-2"
          value={selectedTimeZone}
          onChange={e => setSelectedTimeZone(e.target.value)}
          disabled={isLoadingProfile}
        >
          <option value="" disabled>选择你的时区</option>
          {timeZoneOptions.map(tz => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
        <p className="text-sm text-muted-foreground">
          请选择本地时区以获得准确的任务提醒与日程安排
        </p>
      </div>
      <Separator />
      <h4 className="font-medium text-base mb-2 mt-4">工作偏好设定</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="workStartTime">每日工作开始</Label>
          <Input
            id="workStartTime"
            type="time"
            value={workStartTime}
            onChange={e => setWorkStartTime(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workEndTime">每日工作结束</Label>
          <Input
            id="workEndTime"
            type="time"
            value={workEndTime}
            onChange={e => setWorkEndTime(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="focusDuration">专注时长 (分钟)</Label>
          <Input
            id="focusDuration"
            type="number"
            min={10}
            max={180}
            step={5}
            value={focusDuration}
            onChange={e => setFocusDuration(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="breakDuration">休息时间 (分钟)</Label>
          <Input
            id="breakDuration"
            type="number"
            min={5}
            max={60}
            step={1}
            value={breakDuration}
            onChange={e => setBreakDuration(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label htmlFor="bufferMinutes">任务间缓冲时间 (分钟)</Label>
          <Input
            id="bufferMinutes"
            type="number"
            min={0}
            max={60}
            step={1}
            value={bufferMinutes}
            onChange={e => setBufferMinutes(Number(e.target.value))}
          />
        </div>
      </div>
      <Button onClick={handleSaveProfile} disabled={isLoadingProfile || isSavingProfile}>
        {isSavingProfile ? '保存中...' : '保存设置'}
      </Button>
    </div>
  );
}
