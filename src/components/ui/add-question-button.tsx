"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddQuestionButtonProps {
  onClick: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export function AddQuestionButton({
  onClick,
  variant = "default",
  size = "default",
  className = "",
  children,
}: AddQuestionButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={className}
    >
      <Plus className="mr-2 h-4 w-4" />
      {children || "Add Question"}
    </Button>
  );
}
