
import React from "react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

type AppearanceSettingsFormProps = {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
};

export function AppearanceSettingsForm({ darkMode, setDarkMode }: AppearanceSettingsFormProps) {
  return (
    <div className="space-y-6">
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
        <select
          id="fontSize"
          className="w-full border rounded px-3 py-2"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="density">Display Density</Label>
        <select
          id="density"
          className="w-full border rounded px-3 py-2"
        >
          <option value="compact">Compact</option>
          <option value="comfortable">Comfortable</option>
          <option value="spacious">Spacious</option>
        </select>
      </div>
    </div>
  );
}
