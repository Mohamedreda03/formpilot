"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Settings, Share2, Save } from "lucide-react";

interface FormHeaderProps {
  title: string;
  onBack: () => void;
  onPreview?: () => void;
  onSettings?: () => void;
  onShare?: () => void;
  onSave?: () => void;
}

export function FormHeader({
  title,
  onBack,
  onPreview,
  onSettings,
  onShare,
  onSave,
}: FormHeaderProps) {
  return (
    <div className="border-b">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSettings && (
            <Button variant="outline" size="sm" onClick={onSettings}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          )}

          {onPreview && (
            <Button variant="outline" size="sm" onClick={onPreview}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          )}

          {onShare && (
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          )}

          {onSave && (
            <Button size="sm" onClick={onSave}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
