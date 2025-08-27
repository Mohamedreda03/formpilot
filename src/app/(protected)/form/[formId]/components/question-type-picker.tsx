"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  QUESTION_CATEGORIES,
  getQuestionTypesByCategory,
  QuestionType,
} from "@/lib/question-types";
import { cn } from "@/lib/utils";

export type { QuestionType } from "@/lib/question-types";

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  placeholder?: string;
  options?: string[];
  maxRating?: number;
  acceptedFormats?: string;
}

interface QuestionTypePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: QuestionType) => void;
}

export default function QuestionTypePicker({
  isOpen,
  onClose,
  onSelectType,
}: QuestionTypePickerProps) {
  const handleSelectType = (type: QuestionType) => {
    onSelectType(type);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Question Type</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {QUESTION_CATEGORIES.map((category) => {
            const questionTypes = getQuestionTypesByCategory(category.id);

            return (
              <div key={category.id}>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  {category.label}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {questionTypes.map((questionType) => {
                    const IconComponent = questionType.icon;

                    return (
                      <button
                        key={questionType.type}
                        onClick={() =>
                          handleSelectType(questionType.type as QuestionType)
                        }
                        className={cn(
                          "p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors text-left group",
                          "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={cn("p-2 rounded-md", questionType.color)}
                          >
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                              {questionType.label}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
