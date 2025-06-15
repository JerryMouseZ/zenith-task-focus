
import React from "react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

type NotificationsSettingsFormProps = {
  notifications: boolean;
  setNotifications: (val: boolean) => void;
};

export function NotificationsSettingsForm({ notifications, setNotifications }: NotificationsSettingsFormProps) {
  return (
    <div className="space-y-6">
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
    </div>
  );
}
