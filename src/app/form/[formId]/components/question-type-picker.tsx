"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  QUESTION_TYPES,
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
  const handleTypeSelect = (type: QuestionType) => {
    onSelectType(type);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Choose Question Type
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-h-[65vh] overflow-y-auto">
          {QUESTION_CATEGORIES.map((category) => {
            const categoryTypes = getQuestionTypesByCategory(category.id);

            return (
              <div key={category.id}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg max-md:text-xl font-medium">
                    {category.label}
                  </h3>
                  <Badge variant="outline">{categoryTypes.length}</Badge>
                </div>

                <div className="flex flex-col gap-3">
                  {categoryTypes.map((config) => {
                    const IconComponent = config.icon;
                    return (
                      <button
                        key={config.type}
                        onClick={() =>
                          handleTypeSelect(config.type as QuestionType)
                        }
                        className={`flex items-center gap-3 rounded-lg transition-all cursor-pointer`}
                      >
                        <div className="flex-shrink-0">
                          <IconComponent
                            className={cn(
                              "h-5 w-5 max-md:h-8 max-md:w-8",
                              config.color
                            )}
                          />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-base max-md:text-xl">
                            {config.label}
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
