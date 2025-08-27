"use client";

import React from "react";
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
          icon: "↗",
          label: "Welcome Page",
        }
      : {
          title: form.outroTitle || "Thank You",
          description:
            form.outroDescription ||
            "Your response has been submitted successfully",
          buttonText: form.outroButtonText || "Submit",
          icon: "✓",
          label: "Thank You Page",
        };

  return (
    <div className="h-full p-4 overflow-y-auto">
      {/* Full Screen Dashed Border Container */}
      <div className="h-full w-full border-2 border-dashed border-gray-300 rounded-2xl bg-white flex items-center justify-center">
        <div className="w-full max-w-3xl mx-auto px-12 space-y-12">
          {/* Page Icon/Number with elegant styling */}
          <div className="flex items-center space-x-6">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-2xl text-white font-semibold text-lg shadow-lg ${
                pageType === "intro"
                  ? "bg-gradient-to-br from-emerald-600 to-emerald-700"
                  : "bg-gradient-to-br from-violet-600 to-violet-700"
              }`}
            >
              {pageData.icon}
            </div>
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-0.5 bg-gradient-to-r rounded-full ${
                  pageType === "intro"
                    ? "from-emerald-300 to-transparent"
                    : "from-violet-300 to-transparent"
                }`}
              ></div>
              <span className="text-slate-400 font-medium">
                {pageData.label}
              </span>
            </div>
          </div>

          {/* Page Content with improved typography */}
          <div className="space-y-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-[1.1] tracking-tight">
              {pageData.title}
            </h1>

            {pageData.description && (
              <p className="text-xl text-slate-600 leading-relaxed font-medium max-w-2xl mx-auto">
                {pageData.description}
              </p>
            )}
          </div>

          {/* Enhanced Action Button Preview */}
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-4 text-slate-500 font-medium">
              <span className="text-lg">Press</span>
              <kbd className="px-4 py-2 bg-slate-100 rounded-xl border-2 border-slate-200 text-sm font-bold shadow-sm">
                Enter
              </kbd>
              <span className="text-lg">or click</span>
            </div>

            <button
              className={`px-8 py-4 text-lg font-bold rounded-2xl shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 ${
                pageType === "intro"
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white focus:ring-emerald-200"
                  : "bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white focus:ring-violet-200"
              }`}
              disabled
            >
              {pageData.buttonText}
            </button>
          </div>

          {/* Page Type Badge */}
          <div className="flex justify-center pt-4">
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                pageType === "intro"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-violet-100 text-violet-700"
              }`}
            >
              {pageType === "intro" ? "Intro Page" : "Outro Page"}
            </div>
          </div>

          {/* Bottom spacing */}
          <div className="pb-8"></div>
        </div>
      </div>
    </div>
  );
}
