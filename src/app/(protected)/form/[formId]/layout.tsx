"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Eye, Save, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormStore } from "@/stores/form-store";

interface FormLayoutProps {
  children: React.ReactNode;
  params: Promise<{ formId: string }>;
}

const navigationTabs = [
  { id: "content", label: "Content", path: "" },
  { id: "workflow", label: "Workflow", path: "/workflow" },
  { id: "connect", label: "Connect", path: "/connect" },
];

export default function FormLayout({ children, params }: FormLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [formId, setFormId] = React.useState<string>("");
  const { form } = useFormStore();

  React.useEffect(() => {
    params.then((p) => setFormId(p.formId));
  }, [params]);

  const getActiveTab = () => {
    if (pathname.includes("/workflow")) return "workflow";
    if (pathname.includes("/connect")) return "connect";
    return "content";
  };

  const handleTabClick = (tab: (typeof navigationTabs)[0]) => {
    if (!formId) return;
    const basePath = `/form/${formId}`;
    router.push(basePath + tab.path);
  };

  const activeTab = getActiveTab();
  const activeTabIndex = navigationTabs.findIndex(
    (tab) => tab.id === activeTab
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header with Navigation */}
      <header className="relative bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section: Back Button + Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>

              {/* Separator */}
              <div className="w-px h-6 bg-gray-300"></div>

              {/* Form Title */}
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {form?.title || "Untitled Form"}
                </h1>
              </div>
            </div>

            {/* Center Section: Navigation Tabs with Smooth Indicator */}
            <div className="relative flex items-center space-x-1">
              {/* Smooth sliding indicator line */}
              <div
                className="absolute h-0.5 bg-slate-700 rounded-full transition-all duration-300 ease-in-out"
                style={{
                  top: "-16px",
                  width: `calc(${100 / navigationTabs.length}% - 4px)`,
                  left: `calc(${
                    activeTabIndex * (100 / navigationTabs.length)
                  }% + 2px)`,
                  transform: "translateX(0)",
                }}
              />
              {navigationTabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    activeTab === tab.id
                      ? "text-slate-700 bg-slate-100"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right Section: Action Buttons */}
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-200">
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>

              <button className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-200">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              <button className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-slate-700 text-white hover:bg-slate-800 rounded-lg transition-all duration-200 shadow-sm hover:shadow">
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
