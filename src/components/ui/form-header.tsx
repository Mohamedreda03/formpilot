"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Settings, Share2, Save } from "lucide-react";
import { Separator } from "./separator";

interface FormHeaderProps {
  title: string;
  onBack: () => void;
  onPreview?: () => void;
  onSettings?: () => void;
  onShare?: () => void;
}

export function FormHeader({
  title,
  onBack,
  onPreview,
  onSettings,
  onShare,
}: FormHeaderProps) {
  return (
    <div className="border-b border-gray-200 shadow-none">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>

          {/* <Separator orientation="vertical" className="w-2" /> */}

          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* TODO: Add subscription button */}

          {onPreview && (
            <Button variant="outline" size="sm" onClick={onPreview}>
              <Eye className="h-4 w-4" />
            </Button>
          )}

          {onShare && (
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
