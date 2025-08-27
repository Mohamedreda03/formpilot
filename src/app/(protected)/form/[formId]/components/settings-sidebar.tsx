"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useFormStore } from "@/stores/form-store";

export default function SettingsSidebar() {
  const { form, updateForm } = useFormStore();

  if (!form) {
    return null;
  }

  const handleSettingChange = (setting: string, value: boolean | string) => {
    if (typeof value === "boolean") {
      updateForm({
        settings: {
          ...form.settings,
          [setting]: value,
        },
      });
    } else {
      updateForm({ [setting]: value });
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Form Settings</h3>
        <p className="text-sm text-gray-500 mt-1">
          Configure your form options and behavior
        </p>
      </div>

      <div className="p-4">
        <Accordion
          type="multiple"
          defaultValue={["general", "submission"]}
          className="space-y-2"
        >
          <AccordionItem value="general">
            <AccordionTrigger className="text-sm font-medium">
              General Settings
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="form-title">Form Title</Label>
                <Input
                  id="form-title"
                  value={form.title}
                  onChange={(e) => handleSettingChange("title", e.target.value)}
                  placeholder="Enter form title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-description">Description</Label>
                <Input
                  id="form-description"
                  value={form.description || ""}
                  onChange={(e) =>
                    handleSettingChange("description", e.target.value)
                  }
                  placeholder="Enter form description"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="submission">
            <AccordionTrigger className="text-sm font-medium">
              Submission Settings
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Allow Anonymous</Label>
                  <p className="text-xs text-gray-500">
                    Let users submit without signing in
                  </p>
                </div>
                <Switch
                  checked={form.settings.allowAnonymous}
                  onCheckedChange={(checked) =>
                    handleSettingChange("allowAnonymous", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Require Email</Label>
                  <p className="text-xs text-gray-500">
                    Users must provide an email address
                  </p>
                </div>
                <Switch
                  checked={form.settings.requireEmail}
                  onCheckedChange={(checked) =>
                    handleSettingChange("requireEmail", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    Multiple Submissions
                  </Label>
                  <p className="text-xs text-gray-500">
                    Allow users to submit multiple times
                  </p>
                </div>
                <Switch
                  checked={form.settings.multipleSubmissions}
                  onCheckedChange={(checked) =>
                    handleSettingChange("multipleSubmissions", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Show Progress</Label>
                  <p className="text-xs text-gray-500">
                    Display progress bar to users
                  </p>
                </div>
                <Switch
                  checked={form.settings.showProgress}
                  onCheckedChange={(checked) =>
                    handleSettingChange("showProgress", checked)
                  }
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="intro">
            <AccordionTrigger className="text-sm font-medium">
              Intro Page
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="intro-title">Title</Label>
                <Input
                  id="intro-title"
                  value={form.introTitle || ""}
                  onChange={(e) =>
                    handleSettingChange("introTitle", e.target.value)
                  }
                  placeholder="Welcome to our survey"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="intro-description">Description</Label>
                <Input
                  id="intro-description"
                  value={form.introDescription || ""}
                  onChange={(e) =>
                    handleSettingChange("introDescription", e.target.value)
                  }
                  placeholder="Survey description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="intro-button">Button Text</Label>
                <Input
                  id="intro-button"
                  value={form.introButtonText || ""}
                  onChange={(e) =>
                    handleSettingChange("introButtonText", e.target.value)
                  }
                  placeholder="Start"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="outro">
            <AccordionTrigger className="text-sm font-medium">
              Thank You Page
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="outro-title">Title</Label>
                <Input
                  id="outro-title"
                  value={form.outroTitle || ""}
                  onChange={(e) =>
                    handleSettingChange("outroTitle", e.target.value)
                  }
                  placeholder="Thank you"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outro-description">Description</Label>
                <Input
                  id="outro-description"
                  value={form.outroDescription || ""}
                  onChange={(e) =>
                    handleSettingChange("outroDescription", e.target.value)
                  }
                  placeholder="Thank you message"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outro-button">Button Text</Label>
                <Input
                  id="outro-button"
                  value={form.outroButtonText || ""}
                  onChange={(e) =>
                    handleSettingChange("outroButtonText", e.target.value)
                  }
                  placeholder="Submit"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Questions:</span>
            <Badge variant="secondary">{form.questions.length}</Badge>
          </div>
          <div className="flex justify-between">
            <span>Required:</span>
            <Badge variant="secondary">
              {form.questions.filter((q) => q.required).length}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
