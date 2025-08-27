"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useFormStore } from "@/stores/form-store";

export default function SettingsSidebar() {
  const { form, selectedQuestionId, selectedPage, updateForm, updateQuestion } =
    useFormStore();

  if (!form) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-6">
        <p className="text-gray-500 text-center">No form loaded</p>
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
    if (
      selectedQuestion &&
      selectedQuestion.options &&
      selectedQuestion.options.length > 1
    ) {
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

  // Show Question Settings
  if (selectedQuestion) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-white">
          <h3 className="font-semibold text-gray-900">Question Settings</h3>
          <p className="text-sm text-gray-500 mt-1">
            Question {selectedQuestion.order} • {selectedQuestion.type}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Question Title */}
          <div className="space-y-2">
            <Label htmlFor="question-title">Question</Label>
            <Textarea
              id="question-title"
              value={selectedQuestion.title}
              onChange={(e) => handleQuestionUpdate({ title: e.target.value })}
              placeholder="Type your question"
              rows={2}
              className="text-base"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="question-description">Description (optional)</Label>
            <Textarea
              id="question-description"
              value={selectedQuestion.description || ""}
              onChange={(e) =>
                handleQuestionUpdate({ description: e.target.value })
              }
              placeholder="Add context or instructions"
              rows={2}
              className="text-sm"
            />
          </div>

          {/* Required Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Required</Label>
              <p className="text-xs text-gray-500">
                Users must answer this question
              </p>
            </div>
            <Switch
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
              <Label htmlFor="placeholder">Placeholder</Label>
              <Input
                id="placeholder"
                value={selectedQuestion.placeholder || ""}
                onChange={(e) =>
                  handleQuestionUpdate({ placeholder: e.target.value })
                }
                placeholder="Type your answer here..."
                className="text-sm"
              />
            </div>
          )}

          {/* Options for choice questions */}
          {(selectedQuestion.type === "multiple-choice" ||
            selectedQuestion.type === "checkbox" ||
            selectedQuestion.type === "dropdown") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Choices</Label>
                <Button
                  onClick={addOption}
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {selectedQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm w-6">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Choice ${index + 1}`}
                      className="flex-1 text-sm"
                    />
                    {selectedQuestion.options &&
                      selectedQuestion.options.length > 1 && (
                        <Button
                          onClick={() => removeOption(index)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rating scale */}
          {selectedQuestion.type === "rating" && (
            <div className="space-y-2">
              <Label htmlFor="max-rating">Steps</Label>
              <Input
                id="max-rating"
                type="number"
                min="2"
                max="10"
                value={selectedQuestion.maxRating || 5}
                onChange={(e) =>
                  handleQuestionUpdate({ maxRating: parseInt(e.target.value) })
                }
                className="text-sm"
              />
              <p className="text-xs text-gray-500">
                Number of rating steps (2-10)
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show Page Settings
  if (selectedPage) {
    const pageData =
      selectedPage === "intro"
        ? {
            title: form.introTitle || "",
            description: form.introDescription || "",
            buttonText: form.introButtonText || "",
          }
        : {
            title: form.outroTitle || "",
            description: form.outroDescription || "",
            buttonText: form.outroButtonText || "",
          };

    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-white">
          <h3 className="font-semibold text-gray-900">Page Settings</h3>
          <p className="text-sm text-gray-500 mt-1">
            {selectedPage === "intro" ? "Welcome screen" : "Thank you screen"}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Page Title */}
          <div className="space-y-2">
            <Label htmlFor="page-title">Title</Label>
            <Textarea
              id="page-title"
              value={pageData.title}
              onChange={(e) => handlePageUpdate("Title", e.target.value)}
              placeholder={selectedPage === "intro" ? "Welcome" : "Thank you"}
              rows={2}
              className="text-base"
            />
          </div>

          {/* Page Description */}
          <div className="space-y-2">
            <Label htmlFor="page-description">Description</Label>
            <Textarea
              id="page-description"
              value={pageData.description}
              onChange={(e) => handlePageUpdate("Description", e.target.value)}
              placeholder={
                selectedPage === "intro"
                  ? "Please fill out this form"
                  : "Your response has been submitted"
              }
              rows={3}
              className="text-sm"
            />
          </div>

          {/* Button Text */}
          <div className="space-y-2">
            <Label htmlFor="button-text">Button text</Label>
            <Input
              id="button-text"
              value={pageData.buttonText}
              onChange={(e) => handlePageUpdate("ButtonText", e.target.value)}
              placeholder={selectedPage === "intro" ? "Start" : "Submit"}
              className="text-sm"
            />
          </div>
        </div>
      </div>
    );
  }

  // No selection
  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 flex items-center justify-center">
      <div className="text-center space-y-2 p-6">
        <p className="text-gray-400 text-sm">
          Select a question or page to edit its settings
        </p>
      </div>
    </div>
  );
}
