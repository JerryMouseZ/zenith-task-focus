
import React from "react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export function PrivacySettingsForm() {
  return (
    <div className="space-y-6">
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
        <select
          id="dataRetention"
          className="w-full border rounded px-3 py-2"
        >
          <option value="30days">30 Days</option>
          <option value="6months">6 Months</option>
          <option value="1year">1 Year</option>
          <option value="forever">Forever</option>
        </select>
        <p className="text-sm text-muted-foreground">
          How long to keep completed tasks and analytics data
        </p>
      </div>
    </div>
  );
}

import { Switch } from "@/components/ui/switch";
