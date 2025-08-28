"use client";

import React from "react";
import { FileText, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";

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
        }
      : {
          label: "Thank You Page",
        };

  return (
    <div
      className={cn(
        "w-full rounded-lg px-4 py-2 cursor-pointer transition-all duration-200 border-2 border-dashed",
        isSelected ? "border-destructive" : ""
      )}
      onClick={onSelect}
    >
      {/* Document-like header */}
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4">
          <Icon className={cn("w-4 h-4")} />
        </div>
        <h4 className={cn("text-sm font-semibold truncate line-clamp-1")}>
          {title || (type === "intro" ? "Welcome" : "Thank You")}
        </h4>

        <Badge className={cn("ml-auto")}>
          {type === "intro" ? "Start" : "Submit"}
        </Badge>
      </div>
    </div>
  );
}
