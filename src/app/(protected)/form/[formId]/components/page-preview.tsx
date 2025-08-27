"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormStore } from "@/stores/form-store";

interface PagePreviewProps {
  pageType: "intro" | "outro";
}

export default function PagePreview({ pageType }: PagePreviewProps) {
  const { form } = useFormStore();

  if (!form) {
    return null;
  }

  const pageData =
    pageType === "intro"
      ? {
          title: form.introTitle || "Welcome",
          description: form.introDescription || "Please fill out this form",
          buttonText: form.introButtonText || "Start",
        }
      : {
          title: form.outroTitle || "Thank you",
          description:
            form.outroDescription || "Your response has been submitted",
          buttonText: form.outroButtonText || "Submit",
        };

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {pageData.title}
            </CardTitle>
            {pageData.description && (
              <p className="text-gray-600 text-lg leading-relaxed">
                {pageData.description}
              </p>
            )}
          </CardHeader>
          <CardContent className="text-center pb-8">
            <Button size="lg" className="px-8 py-3 text-lg">
              {pageData.buttonText}
            </Button>
          </CardContent>
        </Card>

        {pageType === "intro" && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              This is a preview of your introduction page
            </p>
          </div>
        )}

        {pageType === "outro" && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              This is a preview of your thank you page
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
