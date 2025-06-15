
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

type AISettingsFormProps = {
  selectedModel: string;
  setSelectedModel: (val: string) => void;
  baseUrl: string;
  setBaseUrl: (val: string) => void;
  apiKey: string;
  setApiKey: (val: string) => void;
};

export function AISettingsForm({
  selectedModel,
  setSelectedModel,
  baseUrl,
  setBaseUrl,
  apiKey,
  setApiKey,
}: AISettingsFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="model">AI Model</Label>
        <Input
          id="model"
          type="text"
          placeholder="e.g. gemini-flash-preview-05-20, gpt-4, llama-3, etc."
          value={selectedModel}
          onChange={e => setSelectedModel(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Enter any model name supported by your provider. Default: gemini-flash-preview-05-20
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="baseUrl">OpenAI-Compatible Base URL (Optional)</Label>
        <Input
          id="baseUrl"
          type="url"
          placeholder="https://api.openai.com/v1 or your custom endpoint"
          value={baseUrl}
          onChange={e => setBaseUrl(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Leave empty to use the default endpoint. For custom providers, enter their OpenAI-compatible API base URL.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="apiKey">API Key</Label>
        <Input
          id="apiKey"
          type="password"
          placeholder="Enter your API key"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Your API key is stored securely and encrypted.
        </p>
      </div>
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
    </div>
  );
}
