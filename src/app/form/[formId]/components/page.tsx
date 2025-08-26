"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  type: "intro" | "outro";
  title: string;
  description: string;
  buttonText: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function Page({
  type,
  title,
  description,
  buttonText,
  isSelected,
  onClick,
}: PageProps) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-muted hover:border-primary/50"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-8 text-center">
        <div className="mb-6">
          <Badge
            variant={type === "intro" ? "default" : "secondary"}
            className="mb-3"
          >
            {type === "intro" ? "Welcome Page" : "Thank You Page"}
          </Badge>

          <h1 className="text-2xl font-bold mb-4">
            {title ||
              (type === "intro"
                ? "Welcome to our survey"
                : "Thank you for your time")}
          </h1>

          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {description ||
              (type === "intro"
                ? "We'd love to hear your thoughts. Please take a few minutes to complete this survey."
                : "Your responses have been recorded. We appreciate your feedback!")}
          </p>

          <Button size="lg" className="min-w-[120px]">
            {buttonText || (type === "intro" ? "Start" : "Submit")}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Click to edit {type === "intro" ? "intro" : "outro"} page
        </div>
      </CardContent>
    </Card>
  );
}
