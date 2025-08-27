"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit3 } from "lucide-react";

interface PageData {
  title: string;
  description: string;
  buttonText: string;
}

interface PageEditorProps {
  pageType: "intro" | "outro";
  pageData: PageData;
  onUpdate: (updates: Partial<PageData>) => void;
}

export default function PageEditor({
  pageType,
  pageData,
  onUpdate,
}: PageEditorProps) {
  const Icon = pageType === "intro" ? FileText : Edit3;
  const pageTitle =
    pageType === "intro" ? "Introduction Page" : "Thank You Page";
  const colorClass =
    pageType === "intro"
      ? "bg-blue-50 text-blue-600 border-blue-200"
      : "bg-green-50 text-green-600 border-green-200";

  return (
    <div className="w-[95%] h-[83vh] mx-auto p-8 space-y-8 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-background/50 m-8 flex items-center justify-center">
      {/* Page Content */}
      <div className="max-w-3xl w-full">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-muted-foreground min-w-[40px]">
              📄
            </span>
            <input
              type="text"
              value={pageData.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder={`${pageTitle} title...`}
              className="flex-1 text-xl font-medium bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground/50"
            />
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <Badge variant="secondary" className="text-xs">
                {pageType === "intro" ? "Start" : "End"}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <div className="ml-14">
            <input
              type="text"
              value={pageData.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Add a description for this page..."
              className="w-full text-sm text-muted-foreground bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground/40"
            />
          </div>
        </div>

        {/* Button Text */}
        <div className="ml-14 space-y-3 pt-4">
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 rounded border-2 border-purple-300 flex items-center justify-center bg-purple-50">
              <span className="text-xs font-medium text-purple-600">🔘</span>
            </div>
            <input
              type="text"
              value={pageData.buttonText}
              onChange={(e) => onUpdate({ buttonText: e.target.value })}
              placeholder={`Button text (e.g., ${
                pageType === "intro" ? "Start Survey" : "Submit"
              })...`}
              className="flex-1 text-base bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Preview of the page */}
        <div className="ml-14 space-y-3 pt-6">
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 rounded border-2 border-gray-300 flex items-center justify-center bg-gray-50">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50 text-center">
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-muted-foreground/80">
                  {pageData.title || `${pageTitle} Preview`}
                </h3>
                <p className="text-sm text-muted-foreground/60">
                  {pageData.description ||
                    "Page description will appear here..."}
                </p>
                <div className="pt-2">
                  <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary/70 rounded-md text-sm font-medium border border-dashed border-primary/30">
                    {pageData.buttonText ||
                      (pageType === "intro" ? "Start" : "Submit")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
