"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Type, FileText, Edit3 } from "lucide-react";
import { Question, QuestionType } from "./question-type-picker";
import { QUESTION_TYPES, getQuestionTypeConfig } from "@/lib/question-types";
import { useFormStore, useDebouncedFormActions } from "@/stores/form-store";
import QuestionEditor from "./question-editor";

interface PageData {
  title: string;
  description: string;
  buttonText: string;
}

interface SettingsSidebarProps {
  // No props needed since we're using global store
}

export default function SettingsSidebar({}: SettingsSidebarProps) {
  // Get state and actions from Zustand store
  const {
    form,
    selectedQuestionId,
    selectedPage,
    updateQuestion,
    updateIntroPage,
    updateOutroPage,
    changeQuestionType,
  } = useFormStore();

  // Get debounced save actions
  const { debouncedSaveQuestion, debouncedSaveIntro, debouncedSaveOutro } =
    useDebouncedFormActions();

  // Get selected question and page data from store
  const selectedQuestion = selectedQuestionId
    ? form?.questions.find((q) => q.id === selectedQuestionId) || null
    : null;

  const currentPageData =
    selectedPage === "intro"
      ? {
          title: form?.introTitle || "Welcome to our survey",
          description:
            form?.introDescription ||
            "We'd love to hear your thoughts. Please take a few minutes to complete this survey.",
          buttonText: form?.introButtonText || "Start",
        }
      : selectedPage === "outro"
      ? {
          title: form?.outroTitle || "Thank you for your time",
          description:
            form?.outroDescription ||
            "Your responses have been recorded. We appreciate your feedback!",
          buttonText: form?.outroButtonText || "Submit",
        }
      : null;

  // Local state for immediate UI updates
  const [localQuestion, setLocalQuestion] = useState<Question | null>(null);
  const [localPageData, setLocalPageData] = useState<PageData | null>(null);

  // Update local state when store changes
  useEffect(() => {
    setLocalQuestion(selectedQuestion);
  }, [selectedQuestion]);

  useEffect(() => {
    setLocalPageData(currentPageData);
  }, [currentPageData]);

  // Helper functions for updating local state and triggering debounced saves
  const updateLocalQuestion = (updates: Partial<Question>) => {
    if (localQuestion && selectedQuestionId) {
      const updatedQuestion = { ...localQuestion, ...updates };
      setLocalQuestion(updatedQuestion);

      // Update store immediately for other components
      updateQuestion(selectedQuestionId, updates);

      // Trigger debounced save to server
      debouncedSaveQuestion({ questionId: selectedQuestionId, updates });
    }
  };

  const updateLocalPage = (updates: Partial<PageData>) => {
    if (localPageData && selectedPage) {
      const updatedPage = { ...localPageData, ...updates };
      setLocalPageData(updatedPage);

      // Update store immediately for other components
      if (selectedPage === "intro") {
        updateIntroPage(updates);
        debouncedSaveIntro(updatedPage);
      } else {
        updateOutroPage(updates);
        debouncedSaveOutro(updatedPage);
      }
    }
  };

  if (!localQuestion && !selectedPage) {
    return (
      <div className="w-80 border-l bg-muted/10 p-6 h-screen sticky top-0 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-muted">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Settings</h3>
        </div>

        <div className="text-center py-12 text-muted-foreground">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm">Select a question or page to view settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 h-[92vh] border-l bg-muted/10 p-6 sticky top-0 overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-muted">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Settings</h3>
      </div>

      {localQuestion && (
        <div className="space-y-6">
          {/* Question Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Question Type</Label>
            <Select
              value={localQuestion.type}
              onValueChange={(value: QuestionType) =>
                changeQuestionType(localQuestion.id, value)
              }
            >
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {React.createElement(
                      getQuestionTypeConfig(localQuestion.type)?.icon || Type,
                      { className: "h-4 w-4" }
                    )}
                    <span>
                      {getQuestionTypeConfig(localQuestion.type)?.label ||
                        "Question"}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((config) => (
                  <SelectItem key={config.type} value={config.type}>
                    <div className="flex items-center gap-2">
                      {React.createElement(config.icon, {
                        className: "h-4 w-4",
                      })}
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Question Title */}
          <div className="space-y-3">
            <Label htmlFor="question-title" className="text-sm font-medium">
              Question Title
            </Label>
            <Textarea
              id="question-title"
              value={localQuestion.title}
              onChange={(e) => updateLocalQuestion({ title: e.target.value })}
              placeholder="Enter your question..."
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Question Description */}
          <div className="space-y-3">
            <Label
              htmlFor="question-description"
              className="text-sm font-medium"
            >
              Description (Optional)
            </Label>
            <Textarea
              id="question-description"
              value={localQuestion.description || ""}
              onChange={(e) =>
                updateLocalQuestion({ description: e.target.value })
              }
              placeholder="Add helpful text for your respondents..."
              className="min-h-[60px] resize-none"
            />
          </div>

          <Separator />

          {/* Required Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Required</Label>
              <p className="text-xs text-muted-foreground">
                Make this question mandatory
              </p>
            </div>
            <Switch
              checked={localQuestion.required}
              onCheckedChange={(checked) =>
                updateLocalQuestion({ required: checked })
              }
            />
          </div>

          {/* Placeholder (for applicable question types) */}
          {(localQuestion.type === "text" ||
            localQuestion.type === "email" ||
            localQuestion.type === "textarea" ||
            localQuestion.type === "number" ||
            localQuestion.type === "phone" ||
            localQuestion.type === "url") && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label
                  htmlFor="question-placeholder"
                  className="text-sm font-medium"
                >
                  Placeholder Text
                </Label>
                <Input
                  id="question-placeholder"
                  value={localQuestion.placeholder || ""}
                  onChange={(e) =>
                    updateLocalQuestion({ placeholder: e.target.value })
                  }
                  placeholder="e.g., Enter your answer here..."
                />
              </div>
            </>
          )}

          {/* Options (for choice questions) */}
          {(localQuestion.type === "multiple-choice" ||
            localQuestion.type === "checkbox" ||
            localQuestion.type === "dropdown") && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-sm font-medium">Options</Label>
                <div className="space-y-2">
                  {(localQuestion.options || []).map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(localQuestion.options || [])];
                          newOptions[index] = e.target.value;
                          updateLocalQuestion({ options: newOptions });
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newOptions = (
                            localQuestion.options || []
                          ).filter((_, i) => i !== index);
                          updateLocalQuestion({ options: newOptions });
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newOptions = [
                        ...(localQuestion.options || []),
                        `Option ${(localQuestion.options || []).length + 1}`,
                      ];
                      updateLocalQuestion({ options: newOptions });
                    }}
                    className="w-full"
                  >
                    Add Option
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Max Rating (for rating questions) */}
          {localQuestion.type === "rating" && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label htmlFor="max-rating" className="text-sm font-medium">
                  Maximum Rating
                </Label>
                <Input
                  id="max-rating"
                  type="number"
                  value={localQuestion.maxRating || 5}
                  onChange={(e) =>
                    updateLocalQuestion({ maxRating: parseInt(e.target.value) })
                  }
                  min="2"
                  max="10"
                />
              </div>
            </>
          )}

          {/* Accepted Formats (for file upload questions) */}
          {localQuestion.type === "file-upload" && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label
                  htmlFor="accepted-formats"
                  className="text-sm font-medium"
                >
                  Accepted File Formats
                </Label>
                <Input
                  id="accepted-formats"
                  value={localQuestion.acceptedFormats || ""}
                  onChange={(e) =>
                    updateLocalQuestion({ acceptedFormats: e.target.value })
                  }
                  placeholder="e.g., .pdf, .doc, .jpg"
                />
              </div>
            </>
          )}
        </div>
      )}

      {selectedPage && localPageData && (
        <div className="space-y-6">
          {/* Page Type */}
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {selectedPage === "intro" ? (
                <FileText className="h-5 w-5" />
              ) : (
                <Edit3 className="h-5 w-5" />
              )}
            </div>
            <div>
              <h4 className="font-medium">
                {selectedPage === "intro"
                  ? "Introduction Page"
                  : "Thank You Page"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {selectedPage === "intro"
                  ? "Welcome message for respondents"
                  : "Final message after submission"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Page Title */}
          <div className="space-y-3">
            <Label htmlFor="page-title" className="text-sm font-medium">
              Page Title
            </Label>
            <Input
              id="page-title"
              value={localPageData.title}
              onChange={(e) => updateLocalPage({ title: e.target.value })}
              placeholder="Enter page title..."
            />
          </div>

          {/* Page Description */}
          <div className="space-y-3">
            <Label htmlFor="page-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="page-description"
              value={localPageData.description}
              onChange={(e) => updateLocalPage({ description: e.target.value })}
              placeholder="Enter page description..."
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Button Text */}
          <div className="space-y-3">
            <Label htmlFor="button-text" className="text-sm font-medium">
              Button Text
            </Label>
            <Input
              id="button-text"
              value={localPageData.buttonText}
              onChange={(e) => updateLocalPage({ buttonText: e.target.value })}
              placeholder="Enter button text..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
