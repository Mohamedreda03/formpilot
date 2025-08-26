"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit3 } from "lucide-react";

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
  const Icon = type === "intro" ? FileText : Edit3;
  const label = type === "intro" ? "Introduction Page" : "Thank You Page";
  const colorClass =
    type === "intro"
      ? "bg-blue-50 text-blue-600 border-blue-200"
      : "bg-green-50 text-green-600 border-green-200";

  return (
    <Card
      className={`group p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "hover:border-primary/20"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={`p-1.5 rounded flex-shrink-0 ${colorClass}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              {label}
            </span>
            <Badge variant="secondary" className="text-xs px-1 py-0">
              {type === "intro" ? "Start" : "End"}
            </Badge>
          </div>
          <p className="text-sm font-medium line-clamp-2 leading-relaxed">
            {title || `${label} Title`}
          </p>
        </div>
      </div>
    </Card>
  );
}
