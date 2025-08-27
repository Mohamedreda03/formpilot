"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Copy, Trash2, GripVertical } from "lucide-react";
import { Question } from "@/app/(protected)/[formId]/components/question-type-picker";
import { getQuestionTypeConfig } from "@/lib/question-types";

interface QuestionItemProps {
  question: Question;
  isSelected: boolean;
  isDragging?: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  dragAttributes?: any;
  dragListeners?: any;
  style?: React.CSSProperties;
  ref?: React.RefObject<HTMLDivElement>;
}

export const QuestionItem = React.forwardRef<HTMLDivElement, QuestionItemProps>(
  (
    {
      question,
      isSelected,
      isDragging = false,
      onSelect,
      onDuplicate,
      onDelete,
      dragAttributes,
      dragListeners,
      style,
    },
    ref
  ) => {
    const questionConfig = getQuestionTypeConfig(question.type);
    const IconComponent = questionConfig?.icon;

    return (
      <Card
        ref={ref}
        style={style}
        className={`group p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected
            ? "border-primary bg-primary/5 shadow-sm"
            : "hover:border-primary/20"
        } ${isDragging ? "shadow-lg scale-105" : ""}`}
        onClick={onSelect}
      >
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              {...dragAttributes}
              {...dragListeners}
              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/50 transition-colors"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div
              className={`p-1.5 rounded flex-shrink-0 ${
                questionConfig?.color || "bg-gray-50 text-gray-600"
              }`}
            >
              {IconComponent ? (
                <IconComponent className="h-4 w-4" />
              ) : (
                <span className="h-4 w-4">?</span>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                {questionConfig?.label || "Question"}
              </span>
              {question.required && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  Required
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium line-clamp-2 leading-relaxed">
              {question.title || "Untitled Question"}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    );
  }
);

QuestionItem.displayName = "QuestionItem";
