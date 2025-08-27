"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import { useFormStore } from "@/stores/form-store";
import {
  QUESTION_TYPES,
  getQuestionTypeConfig,
  QuestionType,
} from "@/lib/question-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function SettingsSidebar() {
  const { form, selectedQuestionId, selectedPage, updateForm, updateQuestion } =
    useFormStore();

  if (!form) {
    return (
      <div className="w-72 bg-gray-50 border-l border-gray-200 p-4 overflow-hidden">
        <p className="text-gray-500 text-center text-sm">No form loaded</p>
      </div>
    );
  }

  const selectedQuestion = selectedQuestionId
    ? form.questions.find((q) => q.id === selectedQuestionId)
    : null;

  const handleQuestionUpdate = (updates: any) => {
    if (selectedQuestionId) {
      updateQuestion(selectedQuestionId, updates);
    }
  };

  const handleQuestionTypeChange = (newType: QuestionType) => {
    if (selectedQuestion) {
      const updates: any = { type: newType };

      // Reset type-specific properties when changing type
      if (!["multiple-choice", "checkbox", "dropdown"].includes(newType)) {
        updates.options = undefined;
      } else if (!selectedQuestion.options) {
        updates.options = ["Option 1", "Option 2"];
      }

      if (newType !== "rating") {
        updates.maxRating = undefined;
      } else if (!selectedQuestion.maxRating) {
        updates.maxRating = 5;
      }

      handleQuestionUpdate(updates);
    }
  };

  const handlePageUpdate = (field: string, value: string) => {
    if (selectedPage === "intro") {
      updateForm({ [`intro${field}`]: value });
    } else if (selectedPage === "outro") {
      updateForm({ [`outro${field}`]: value });
    }
  };

  const addOption = () => {
    if (selectedQuestion && selectedQuestion.options) {
      const newOptions = [
        ...selectedQuestion.options,
        `Option ${selectedQuestion.options.length + 1}`,
      ];
      handleQuestionUpdate({ options: newOptions });
    }
  };

  const removeOption = (index: number) => {
    if (selectedQuestion && selectedQuestion.options) {
      const newOptions = selectedQuestion.options.filter((_, i) => i !== index);
      handleQuestionUpdate({ options: newOptions });
    }
  };

  const updateOption = (index: number, value: string) => {
    if (selectedQuestion && selectedQuestion.options) {
      const newOptions = [...selectedQuestion.options];
      newOptions[index] = value;
      handleQuestionUpdate({ options: newOptions });
    }
  };

  // Question Settings
  if (selectedQuestion) {
    const currentTypeConfig = getQuestionTypeConfig(selectedQuestion.type);

    return (
      <div className="w-72 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
        <div className="p-3 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-900 text-sm">
            Question Settings
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Question Type Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Question Type
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10"
                >
                  <div className="flex items-center space-x-2">
                    {currentTypeConfig && (
                      <div
                        className={cn("p-1 rounded", currentTypeConfig.color)}
                      >
                        <currentTypeConfig.icon className="h-3 w-3" />
                      </div>
                    )}
                    <span className="text-sm">
                      {currentTypeConfig?.label || selectedQuestion.type}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 max-h-60 overflow-y-auto">
                {QUESTION_TYPES.map((questionType) => {
                  const IconComponent = questionType.icon;
                  return (
                    <DropdownMenuItem
                      key={questionType.type}
                      onClick={() =>
                        handleQuestionTypeChange(
                          questionType.type as QuestionType
                        )
                      }
                      className="flex items-center space-x-2 p-2"
                    >
                      <div
                        className={cn(
                          "p-1 rounded flex-shrink-0",
                          questionType.color
                        )}
                      >
                        <IconComponent className="h-3 w-3" />
                      </div>
                      <span className="text-sm">{questionType.label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Question Title */}
          <div className="space-y-2">
            <Label
              htmlFor="question-title"
              className="text-sm font-medium text-gray-700"
            >
              Title
            </Label>
            <Textarea
              id="question-title"
              value={selectedQuestion.title}
              onChange={(e) => handleQuestionUpdate({ title: e.target.value })}
              className="min-h-[60px] resize-none"
              placeholder="Enter question title..."
            />
          </div>

          {/* Question Description */}
          <div className="space-y-2">
            <Label
              htmlFor="question-description"
              className="text-sm font-medium text-gray-700"
            >
              Description
            </Label>
            <Textarea
              id="question-description"
              value={selectedQuestion.description || ""}
              onChange={(e) =>
                handleQuestionUpdate({ description: e.target.value })
              }
              className="min-h-[60px] resize-none"
              placeholder="Enter question description..."
            />
          </div>

          {/* Required Toggle */}
          <div className="flex items-center justify-between">
            <Label
              htmlFor="required"
              className="text-sm font-medium text-gray-700"
            >
              Required
            </Label>
            <Switch
              id="required"
              checked={selectedQuestion.required}
              onCheckedChange={(checked) =>
                handleQuestionUpdate({ required: checked })
              }
            />
          </div>

          {/* Placeholder for text inputs */}
          {(selectedQuestion.type === "text" ||
            selectedQuestion.type === "textarea" ||
            selectedQuestion.type === "email" ||
            selectedQuestion.type === "number") && (
            <div className="space-y-2">
              <Label
                htmlFor="placeholder"
                className="text-sm font-medium text-gray-700"
              >
                Placeholder
              </Label>
              <Input
                id="placeholder"
                value={selectedQuestion.placeholder || ""}
                onChange={(e) =>
                  handleQuestionUpdate({ placeholder: e.target.value })
                }
                placeholder="Enter placeholder text..."
              />
            </div>
          )}

          {/* Options for choice questions */}
          {(selectedQuestion.type === "multiple-choice" ||
            selectedQuestion.type === "checkbox" ||
            selectedQuestion.type === "dropdown") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">
                  Choices
                </Label>
                <Button
                  onClick={addOption}
                  size="sm"
                  variant="outline"
                  className="h-7 px-2"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {selectedQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 h-8"
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button
                      onClick={() => removeOption(index)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rating scale */}
          {selectedQuestion.type === "rating" && (
            <div className="space-y-2">
              <Label
                htmlFor="max-rating"
                className="text-sm font-medium text-gray-700"
              >
                Rating Scale (1 to X)
              </Label>
              <Input
                id="max-rating"
                type="number"
                min="2"
                max="10"
                value={selectedQuestion.maxRating || 5}
                onChange={(e) =>
                  handleQuestionUpdate({ maxRating: parseInt(e.target.value) })
                }
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Page Settings
  if (selectedPage) {
    const isIntroPage = selectedPage === "intro";
    const pageTitle = isIntroPage
      ? "Welcome Page Settings"
      : "Thank You Page Settings";

    const titleValue = isIntroPage ? form.introTitle : form.outroTitle;
    const descriptionValue = isIntroPage
      ? form.introDescription
      : form.outroDescription;
    const buttonValue = isIntroPage
      ? form.introButtonText
      : form.outroButtonText;

    const handlePageUpdate = (field: string, value: string) => {
      if (isIntroPage) {
        updateForm({
          [`intro${field}`]: value,
        });
      } else {
        updateForm({
          [`outro${field}`]: value,
        });
      }
    };

    return (
      <div className="w-72 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
        <div className="p-3 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-900 text-sm">{pageTitle}</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Page Title */}
          <div className="space-y-2">
            <Label
              htmlFor="page-title"
              className="text-sm font-medium text-gray-700"
            >
              Title
            </Label>
            <Input
              id="page-title"
              value={titleValue || ""}
              onChange={(e) => handlePageUpdate("Title", e.target.value)}
              placeholder="Enter page title..."
            />
          </div>

          {/* Page Description */}
          <div className="space-y-2">
            <Label
              htmlFor="page-description"
              className="text-sm font-medium text-gray-700"
            >
              Description
            </Label>
            <Textarea
              id="page-description"
              value={descriptionValue || ""}
              onChange={(e) => handlePageUpdate("Description", e.target.value)}
              className="min-h-[80px] resize-none"
              placeholder="Enter page description..."
            />
          </div>

          {/* Button Text */}
          <div className="space-y-2">
            <Label
              htmlFor="button-text"
              className="text-sm font-medium text-gray-700"
            >
              Button Text
            </Label>
            <Input
              id="button-text"
              value={buttonValue || ""}
              onChange={(e) => handlePageUpdate("ButtonText", e.target.value)}
              placeholder="Enter button text..."
            />
          </div>
        </div>
      </div>
    );
  }

  // Default state - no selection
  return (
    <div className="w-72 bg-white border-l border-gray-200 flex items-center justify-center overflow-hidden">
      <div className="text-center space-y-2 p-4">
        <p className="text-gray-500 text-sm">
          Select a question or page to edit its settings
        </p>
      </div>
    </div>
  );
}
