"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface MobileOverlayProps {
  message?: string;
  workspaceId?: string;
  onBack?: () => void;
}

export function MobileOverlay({
  message = "This page is designed for desktop use. Please use a laptop or desktop computer for the best experience.",
  workspaceId,
  onBack,
}: MobileOverlayProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (workspaceId) {
      router.push(`/ws/${workspaceId}`);
    } else {
      router.push("/ws");
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-6 lg:hidden">
      <div className="text-center space-y-6 max-w-md">
        <p className="text-lg text-gray-700 leading-relaxed">{message}</p>

        <button
          onClick={handleBack}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Back to Workspace
        </button>
      </div>
    </div>
  );
}
