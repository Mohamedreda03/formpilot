"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  ChevronDown,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { uploadImage, deleteImage } from "@/lib/image-upload";
import { toast } from "sonner";
import Image from "next/image";
import { cleanImageUrl } from "@/lib/utils";
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
  const [uploading, setUploading] = useState(false);

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

  const handleImageUpload = async (file: File) => {
    if (!selectedQuestion) return;

    try {
      setUploading(true);

      // Delete old image if exists
      if (selectedQuestion.imageUrl) {
        try {
          await deleteImage(selectedQuestion.imageUrl);
        } catch (error) {
          console.warn("Failed to delete old image:", error);
        }
      }

      // Upload new image
      const imageUrl = await uploadImage(file);

      // Clean URL - remove any existing timestamps
      const cleanUrl = cleanImageUrl(imageUrl);

      // Update question with new image URL
      handleQuestionUpdate({ imageUrl: cleanUrl });

      toast.success("Image uploaded and saved successfully!");
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async () => {
    if (!selectedQuestion?.imageUrl) return;

    try {
      setUploading(true);

      // Delete from storage
      await deleteImage(selectedQuestion.imageUrl);

      // Remove from question and save to database
      handleQuestionUpdate({ imageUrl: undefined });

      toast.success("Image deleted and saved successfully!");
    } catch (error) {
      console.error("Image deletion failed:", error);
      toast.error("Failed to delete image. Please try again.");
    } finally {
      setUploading(false);
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

          {/* Question Image Section */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4 text-gray-600" />
              <Label className="text-sm font-medium text-gray-700">
                Question Image
              </Label>
            </div>

            {selectedQuestion.imageUrl ? (
              <div className="space-y-3">
                {/* Image Preview */}
                <div className="relative group">
                  <div className="relative w-full h-32 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                    {uploading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                          <div className="w-6 h-6 mx-auto mb-2 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-xs text-gray-600">Uploading...</p>
                        </div>
                      </div>
                    ) : selectedQuestion.imageUrl ? (
                      <Image
                        key={selectedQuestion.imageUrl}
                        src={selectedQuestion.imageUrl}
                        alt="Question image"
                        fill
                        className="object-cover"
                        sizes="272px"
                        onError={(e) => {
                          // Silent error handling - image loads correctly but Next.js might complain
                        }}
                        unoptimized={true}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                        <div className="text-center text-gray-400">
                          <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-xs">No image</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleImageDelete}
                    disabled={uploading}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Replace Image Button */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="hidden"
                    id="replace-image-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="replace-image-upload"
                    className="flex items-center justify-center w-full p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {uploading ? "Replacing..." : "Replace Image"}
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              /* Upload New Image */
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                  id="question-image-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="question-image-upload"
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-600">
                    {uploading ? "Uploading..." : "Add image to question"}
                  </span>
                </label>
              </div>
            )}
          </div>
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
