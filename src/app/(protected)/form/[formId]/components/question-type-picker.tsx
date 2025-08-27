"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  QUESTION_TYPES,
  QUESTION_CATEGORIES,
  getQuestionTypesByCategory,
} from "@/lib/question-types";
import { QuestionType } from "@/lib/question-types";
import { cn } from "@/lib/utils";

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
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Add Question
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {QUESTION_CATEGORIES.map((category) => {
            const questionTypes = getQuestionTypesByCategory(category.id);

            if (questionTypes.length === 0) return null;

            return (
              <div key={category.id} className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                  {category.label}
                </h3>
                <div className="space-y-1">
                  {questionTypes.map((questionType) => {
                    const IconComponent = questionType.icon;

                    return (
                      <button
                        key={questionType.type}
                        onClick={() =>
                          handleSelectType(questionType.type as QuestionType)
                        }
                        className="w-full p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left group flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                      >
                        <div
                          className={cn(
                            "p-2 rounded-md flex-shrink-0",
                            questionType.color
                          )}
                        >
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                          {questionType.label}
                        </span>
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
