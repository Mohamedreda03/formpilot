"use client";

import React from "react";
import { FileText, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageItemProps {
  type: "intro" | "outro";
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function PageItem({
  type,
  title,
  description,
  isSelected,
  onSelect,
}: PageItemProps) {
  const Icon = type === "intro" ? FileText : CheckSquare;
  const pageConfig =
    type === "intro"
      ? {
          label: "Welcome Page",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
          iconColor: "text-emerald-600",
          textColor: "text-emerald-800",
          labelColor: "text-emerald-600",
        }
      : {
          label: "Thank You Page",
          bgColor: "bg-violet-50",
          borderColor: "border-violet-200",
          iconColor: "text-violet-600",
          textColor: "text-violet-800",
          labelColor: "text-violet-600",
        };

  return (
    <div
      className={cn(
        "w-full rounded-lg p-4 cursor-pointer transition-all duration-200 border-2 border-dashed",
        pageConfig.bgColor,
        pageConfig.borderColor,
        isSelected ? "border-destructive" : ""
      )}
      onClick={onSelect}
    >
      {/* Document-like header */}
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4">
          <Icon className={cn("w-4 h-4", pageConfig.iconColor)} />
        </div>
        <h4
          className={cn(
            "text-sm font-semibold truncate line-clamp-1",
            pageConfig.textColor
          )}
        >
          {title || (type === "intro" ? "Welcome" : "Thank You")}
        </h4>

        <div
          className={cn(
            "inline-block px-3 py-1 rounded text-xs font-medium text-white ml-auto",
            type === "intro" ? "bg-emerald-600" : "bg-violet-600"
          )}
        >
          {type === "intro" ? "Start" : "Submit"}
        </div>
      </div>
    </div>
  );
}
