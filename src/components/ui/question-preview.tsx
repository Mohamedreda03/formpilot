"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, Upload } from "lucide-react";
import { Question } from "@/app/(protected)/[formId]/components/question-type-picker";
import { getQuestionTypeConfig } from "@/lib/question-types";
import { cn } from "@/lib/utils";

interface QuestionPreviewProps {
  question: Question;
  className?: string;
}

export function QuestionPreview({ question, className }: QuestionPreviewProps) {
  const typeConfig = getQuestionTypeConfig(question.type);

  const renderQuestionInput = () => {
    switch (question.type) {
      case "text":
        return (
          <Input
            placeholder={question.placeholder || "Type your answer here..."}
            disabled
            className="cursor-not-allowed"
          />
        );

      case "textarea":
        return (
          <Textarea
            placeholder={question.placeholder || "Type your answer here..."}
            disabled
            className="cursor-not-allowed min-h-[100px]"
          />
        );

      case "email":
        return (
          <Input
            type="email"
            placeholder={question.placeholder || "Enter your email address"}
            disabled
            className="cursor-not-allowed"
          />
        );

      case "number":
        return (
          <Input
            type="number"
            placeholder={question.placeholder || "Enter a number"}
            disabled
            className="cursor-not-allowed"
          />
        );

      case "phone":
        return (
          <Input
            type="tel"
            placeholder={question.placeholder || "Enter your phone number"}
            disabled
            className="cursor-not-allowed"
          />
        );

      case "url":
        return (
          <Input
            type="url"
            placeholder={question.placeholder || "Enter a URL"}
            disabled
            className="cursor-not-allowed"
          />
        );

      case "date":
        return <Input type="date" disabled className="cursor-not-allowed" />;

      case "time":
        return <Input type="time" disabled className="cursor-not-allowed" />;

      case "multiple-choice":
        return (
          <RadioGroup disabled className="space-y-3">
            {(question.options || ["Option 1", "Option 2"]).map(
              (option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="cursor-not-allowed"
                  >
                    {option}
                  </Label>
                </div>
              )
            )}
          </RadioGroup>
        );

      case "checkbox":
        return (
          <div className="space-y-3">
            {(question.options || ["Option 1", "Option 2"]).map(
              (option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox id={`checkbox-${index}`} disabled />
                  <Label
                    htmlFor={`checkbox-${index}`}
                    className="cursor-not-allowed"
                  >
                    {option}
                  </Label>
                </div>
              )
            )}
          </div>
        );

      case "dropdown":
        return (
          <Select disabled>
            <SelectTrigger className="cursor-not-allowed">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {(question.options || ["Option 1", "Option 2"]).map(
                (option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        );

      case "rating":
        const maxRating = question.maxRating || 5;
        return (
          <div className="flex items-center space-x-1">
            {Array.from({ length: maxRating }, (_, i) => (
              <Star
                key={i}
                className="h-6 w-6 text-muted-foreground cursor-not-allowed"
                fill="none"
              />
            ))}
          </div>
        );

      case "file-upload":
        return (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-not-allowed">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {question.acceptedFormats || "Click to upload or drag and drop"}
            </p>
          </div>
        );

      default:
        return (
          <Input
            placeholder="Preview not available"
            disabled
            className="cursor-not-allowed"
          />
        );
    }
  };

  return (
    <Card
      className={cn(
        "p-8 border-2 border-dashed border-muted-foreground/30 bg-background/50",
        className
      )}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "text-sm font-medium px-2 py-1 rounded flex items-center gap-1",
                typeConfig?.color || "bg-muted text-muted-foreground"
              )}
            >
              {typeConfig?.icon &&
                React.createElement(typeConfig.icon, { className: "h-3 w-3" })}
              Q{question.order}
            </span>
            <div className="flex-1">
              <h3 className="text-lg font-medium leading-relaxed">
                {question.title}
                {question.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </h3>
              {question.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {question.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">{renderQuestionInput()}</div>

        {question.required && (
          <p className="text-xs text-muted-foreground">
            * This field is required
          </p>
        )}
      </div>
    </Card>
  );
}
