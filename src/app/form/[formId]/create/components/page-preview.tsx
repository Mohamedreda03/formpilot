"use client";

import React from "react";
import { useFormStore } from "@/stores/form-store";
import { useFormDesign } from "@/hooks/use-form-design";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface PagePreviewProps {
  pageType: "intro" | "outro";
}

export default function PagePreview({ pageType }: PagePreviewProps) {
  const { form } = useFormStore();
  const {
    design,
    getContainerStyles,
    getButtonStyles,
    getAccentTextStyles,
    getTitleStyles,
  } = useFormDesign();

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
          title: form.outroTitle || "Thank You",
          description:
            form.outroDescription ||
            "Your response has been submitted successfully",
          buttonText: form.outroButtonText || "Submit",
        };

  const containerStyles = getContainerStyles(true);
  const buttonStyles = getButtonStyles();

  return (
    <div className="h-full p-4 overflow-y-auto">
      {/* Full Screen Dashed Border Container with Custom Design */}
      <div
        className="h-full w-full border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center"
        style={containerStyles}
      >
        <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-6 md:px-12 lg:px-16 space-y-8 md:space-y-10 lg:space-y-12">
          {/* Logo Section - Show logo instead of decorative icons */}
          {design.logoUrl ? (
            <div className="flex justify-center">
              <div className="relative h-20 md:h-24 w-72 md:w-80">
                <Image
                  src={design.logoUrl}
                  alt="Logo"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 288px, 320px"
                />
              </div>
            </div>
          ) : null}

          {/* Page Content with responsive typography */}
          <div className="space-y-6 md:space-y-8 text-center">
            <h1
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight"
              style={getTitleStyles()}
            >
              {pageData.title}
            </h1>

            {pageData.description && (
              <p
                className="text-base md:text-lg lg:text-xl xl:text-2xl leading-relaxed font-medium max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto"
                style={getAccentTextStyles()}
              >
                {pageData.description}
              </p>
            )}
          </div>

          {/* Enhanced Action Button Preview */}
          <div className="flex flex-col items-center space-y-6 md:space-y-8">
            <button
              className="group relative px-6 py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 text-base md:text-lg lg:text-xl font-bold rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl focus:outline-none focus:ring-4 cursor-pointer"
              style={buttonStyles}
              disabled
            >
              <span className="flex items-center space-x-2">
                <span>{pageData.buttonText}</span>
                {pageType === "intro" ? (
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-1" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
