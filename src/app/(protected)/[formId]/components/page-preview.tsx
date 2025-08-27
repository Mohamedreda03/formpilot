"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Edit3 } from "lucide-react";
import { useFormStore } from "@/stores/form-store";

interface PageData {
  title: string;
  description: string;
  buttonText: string;
}

interface PagePreviewProps {
  pageType: "intro" | "outro";
}

export default function PagePreview({ pageType }: PagePreviewProps) {
  // Get form data from store
  const { form } = useFormStore();

  const Icon = pageType === "intro" ? FileText : Edit3;

  // Get page data from store
  const pageData =
    pageType === "intro"
      ? {
          title: form?.introTitle || "Welcome to our survey",
          description:
            form?.introDescription ||
            "We'd love to hear your thoughts. Please take a few minutes to complete this survey.",
          buttonText: form?.introButtonText || "Start",
        }
      : {
          title: form?.outroTitle || "Thank you for your time",
          description:
            form?.outroDescription ||
            "Your responses have been recorded. We appreciate your feedback!",
          buttonText: form?.outroButtonText || "Submit",
        };

  return (
    <div className="w-[95%] h-[83vh] mx-auto p-8 space-y-8 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-background/50 m-8 flex items-center justify-center">
      <div className="max-w-2xl w-full text-center space-y-6">
        {/* Page Icon */}
        <div className="flex justify-center mb-8">
          <div
            className={`p-6 rounded-full ${
              pageType === "intro"
                ? "bg-blue-50 text-blue-600"
                : "bg-green-50 text-green-600"
            }`}
          >
            <Icon className="h-12 w-12" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground">{pageData.title}</h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
          {pageData.description}
        </p>

        {/* Button */}
        <div className="pt-6">
          <Button size="lg" className="px-8 py-3 text-lg" disabled>
            {pageData.buttonText}
          </Button>
        </div>

        {/* Page indicator */}
        <div className="pt-4">
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {pageType === "intro" ? "Introduction Page" : "Thank You Page"}
          </span>
        </div>
      </div>
    </div>
  );
}
