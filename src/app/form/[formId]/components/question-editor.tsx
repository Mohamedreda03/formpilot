"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, X, GripVertical } from "lucide-react";
import { Question, QuestionType } from "./question-type-picker";
import { getQuestionTypeConfig } from "@/lib/question-types";
import { useFormStore, useDebouncedFormActions } from "@/stores/form-store";

interface QuestionEditorProps {
  // No props needed since we're using global store
}

export default function QuestionEditor({}: QuestionEditorProps) {
  // Get state and actions from Zustand store
  const { form, selectedQuestionId, updateQuestion } = useFormStore();

  // Get debounced save actions
  const { debouncedSaveQuestion } = useDebouncedFormActions();

  // Get selected question from store
  const question = selectedQuestionId
    ? form?.questions.find((q) => q.id === selectedQuestionId)
    : null;

  // Local state for immediate UI updates
  const [localQuestion, setLocalQuestion] = useState<Question | null>(null);

  // Update local state when store changes
  useEffect(() => {
    setLocalQuestion(question || null);
  }, [question]);

  // If no question is selected, show empty state
  if (!localQuestion || !selectedQuestionId) {
    return (
      <div className="w-[95%] h-[83vh] mx-auto p-8 space-y-8 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-background/50 m-8 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <h3 className="text-lg font-medium mb-2">No Question Selected</h3>
          <p>Select a question from the sidebar to start editing</p>
        </div>
      </div>
    );
  }

  // Helper function to update local state and trigger debounced save
  const updateLocalQuestion = (updates: Partial<Question>) => {
    const updatedQuestion = { ...localQuestion, ...updates };
    setLocalQuestion(updatedQuestion);

    // Update store immediately for other components
    updateQuestion(selectedQuestionId, updates);

    // Trigger debounced save to server
    debouncedSaveQuestion({ questionId: selectedQuestionId, updates });
  };

  const addOption = () => {
    const newOptions = [
      ...(localQuestion.options || ["Option 1", "Option 2"]),
      `Option ${(localQuestion.options || []).length + 1}`,
    ];
    updateLocalQuestion({ options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(localQuestion.options || [])];
    newOptions[index] = value;
    updateLocalQuestion({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const currentOptions = localQuestion.options || [];
    if (currentOptions.length > 1) {
      const newOptions = currentOptions.filter(
        (_: string, i: number) => i !== index
      );
      updateLocalQuestion({ options: newOptions });
    }
  };

  const getOptionLetter = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D...
  };

  const questionConfig = getQuestionTypeConfig(localQuestion.type);
  const IconComponent = questionConfig?.icon;

  return (
    <div className="w-[95%] h-[83vh] mx-auto p-8 space-y-8 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-background/50 m-8 flex items-center justify-center">
      {/* Question Input */}
      <div className="max-w-3xl w-full">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-muted-foreground min-w-[40px]">
              {localQuestion.order}.
            </span>
            <input
              type="text"
              value={localQuestion.title}
              onChange={(e) => updateLocalQuestion({ title: e.target.value })}
              placeholder="Type your question here..."
              className="flex-1 text-xl font-medium bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground/50"
            />
            <div className="flex items-center gap-2">
              {IconComponent && (
                <div
                  className={`p-2 rounded-lg ${
                    questionConfig?.color || "bg-gray-50 text-gray-600"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                </div>
              )}
              {localQuestion.required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="ml-14">
            <input
              type="text"
              value={localQuestion.description || ""}
              onChange={(e) =>
                updateLocalQuestion({ description: e.target.value })
              }
              placeholder="Add a description (optional)"
              className="w-full text-sm text-muted-foreground bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground/40"
            />
          </div>

          {/* Placeholder display only for types that support it */}
          {(localQuestion.type === "text" ||
            localQuestion.type === "email" ||
            localQuestion.type === "number" ||
            localQuestion.type === "phone" ||
            localQuestion.type === "url" ||
            localQuestion.type === "address" ||
            localQuestion.type === "textarea" ||
            localQuestion.type === "date" ||
            localQuestion.type === "time") &&
            localQuestion.placeholder && (
              <div className="ml-14">
                <div className="text-sm text-muted-foreground/50 italic">
                  Placeholder: {localQuestion.placeholder}
                </div>
              </div>
            )}

          {/* Options for choice questions */}
          {(localQuestion.type === "multiple-choice" ||
            localQuestion.type === "checkbox" ||
            localQuestion.type === "dropdown") && (
            <div className="ml-14 space-y-3">
              {(localQuestion.options || []).map(
                (option: string, index: number) => (
                  <div key={index} className="flex items-center gap-4 group">
                    <div className="flex items-center gap-3">
                      {localQuestion.type === "multiple-choice" && (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <span className="text-xs font-medium text-muted-foreground">
                            {getOptionLetter(index)}
                          </span>
                        </div>
                      )}
                      {localQuestion.type === "checkbox" && (
                        <div className="w-6 h-6 rounded border-2 border-gray-300 flex items-center justify-center">
                          <span className="text-xs font-medium text-muted-foreground">
                            ✓
                          </span>
                        </div>
                      )}
                      {localQuestion.type === "dropdown" && (
                        <div className="w-6 h-6 rounded border-2 border-gray-300 flex items-center justify-center">
                          <span className="text-xs font-medium text-muted-foreground">
                            {index + 1}
                          </span>
                        </div>
                      )}
                    </div>

                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 text-base bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground/50"
                    />

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeOption(index)}
                        disabled={(localQuestion.options || []).length <= 1}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <div className="cursor-grab active:cursor-grabbing p-1">
                        <GripVertical className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                )
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={addOption}
                className="w-full mt-2 border-dashed"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Option
              </Button>
            </div>
          )}

          {/* Special settings for specific types */}
          {localQuestion.type === "rating" && (
            <div className="ml-14 space-y-3 pt-4">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded border-2 border-orange-300 flex items-center justify-center bg-orange-50">
                  <span className="text-xs font-medium text-orange-600">
                    📊
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={localQuestion.maxRating || 5}
                  onChange={(e) =>
                    updateLocalQuestion({
                      maxRating: parseInt(e.target.value) || 5,
                    })
                  }
                  placeholder="Maximum rating (1-10)"
                  className="flex-1 text-base bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          )}

          {(localQuestion.type === "file-upload" ||
            localQuestion.type === "image") && (
            <div className="ml-14 space-y-3 pt-4">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded border-2 border-green-300 flex items-center justify-center bg-green-50">
                  <span className="text-xs font-medium text-green-600">📋</span>
                </div>
                <input
                  type="text"
                  value={localQuestion.acceptedFormats || ""}
                  onChange={(e) =>
                    updateLocalQuestion({ acceptedFormats: e.target.value })
                  }
                  placeholder={`Accepted ${
                    localQuestion.type === "file-upload" ? "file" : "image"
                  } formats (e.g., PDF, DOC, TXT)`}
                  className="flex-1 text-base bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          )}

          {/* Preview for other question types */}
          {localQuestion.type !== "multiple-choice" &&
            localQuestion.type !== "checkbox" &&
            localQuestion.type !== "dropdown" && (
              <div className="ml-14 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded border-2 border-gray-300 flex items-center justify-center bg-gray-50">
                    {IconComponent ? (
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">
                        ?
                      </span>
                    )}
                  </div>

                  {localQuestion.type === "textarea" ? (
                    <div className="flex-1 p-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50 min-h-[80px] flex items-start">
                      <span className="text-muted-foreground/60 text-sm">
                        {localQuestion.placeholder ||
                          "Long text answer will appear here..."}
                      </span>
                    </div>
                  ) : localQuestion.type === "rating" ? (
                    <div className="flex-1 flex items-center gap-2">
                      {Array.from(
                        { length: localQuestion.maxRating || 5 },
                        (_, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 border-2 border-dashed border-gray-300 rounded bg-gray-50/50 flex items-center justify-center"
                          >
                            <span className="text-xs text-muted-foreground">
                              ⭐
                            </span>
                          </div>
                        )
                      )}
                      <span className="text-xs text-muted-foreground ml-2">
                        Rating scale (1-{localQuestion.maxRating || 5})
                      </span>
                    </div>
                  ) : localQuestion.type === "date" ? (
                    <div className="flex-1 p-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50 flex items-center gap-2">
                      <span className="text-muted-foreground/60 text-sm">
                        📅 {localQuestion.placeholder || "Select a date..."}
                      </span>
                    </div>
                  ) : localQuestion.type === "time" ? (
                    <div className="flex-1 p-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50 flex items-center gap-2">
                      <span className="text-muted-foreground/60 text-sm">
                        🕐 {localQuestion.placeholder || "Select time..."}
                      </span>
                    </div>
                  ) : localQuestion.type === "file-upload" ||
                    localQuestion.type === "image" ? (
                    <div className="flex-1 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50 text-center">
                      <div className="text-2xl mb-2">
                        {localQuestion.type === "file-upload" ? "📁" : "🖼️"}
                      </div>
                      <span className="text-muted-foreground/60 text-sm block">
                        Click to upload{" "}
                        {localQuestion.type === "file-upload"
                          ? "files"
                          : "images"}
                      </span>
                      <span className="text-xs text-muted-foreground/40">
                        {localQuestion.acceptedFormats ||
                          (localQuestion.type === "file-upload"
                            ? "PDF, DOC, TXT"
                            : "JPG, PNG, GIF")}
                      </span>
                    </div>
                  ) : (
                    <div className="flex-1 p-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                      <span className="text-muted-foreground/60 text-sm">
                        {localQuestion.placeholder ||
                          `Enter your ${
                            localQuestion.type === "email"
                              ? "email address"
                              : localQuestion.type === "phone"
                              ? "phone number"
                              : localQuestion.type === "url"
                              ? "website URL"
                              : localQuestion.type === "address"
                              ? "address"
                              : localQuestion.type === "number"
                              ? "number"
                              : "answer"
                          }...`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Question Settings - Removed Required toggle, now only in Settings sidebar */}
        </div>
      </div>
    </div>
  );
}
