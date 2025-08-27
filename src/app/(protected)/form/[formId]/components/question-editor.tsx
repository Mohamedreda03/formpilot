"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useFormStore } from "@/stores/form-store";

export default function QuestionEditor() {
  const { form, selectedQuestionId, updateQuestion } = useFormStore();

  const selectedQuestion = selectedQuestionId
    ? form?.questions.find((q) => q.id === selectedQuestionId)
    : null;

  if (!selectedQuestion) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">No question selected</div>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<typeof selectedQuestion>) => {
    if (selectedQuestionId) {
      updateQuestion(selectedQuestionId, updates);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Question Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="question-title">Question Title</Label>
            <Input
              id="question-title"
              value={selectedQuestion.title}
              onChange={(e) => handleUpdate({ title: e.target.value })}
              placeholder="Enter your question"
            />
          </div>

          <div>
            <Label htmlFor="question-description">Description (Optional)</Label>
            <Textarea
              id="question-description"
              value={selectedQuestion.description || ""}
              onChange={(e) => handleUpdate({ description: e.target.value })}
              placeholder="Add additional context or instructions"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={selectedQuestion.required}
              onCheckedChange={(checked) => handleUpdate({ required: checked })}
            />
            <Label htmlFor="required">Required</Label>
          </div>

          {selectedQuestion.type === "text" ||
          selectedQuestion.type === "textarea" ? (
            <div>
              <Label htmlFor="placeholder">Placeholder Text</Label>
              <Input
                id="placeholder"
                value={selectedQuestion.placeholder || ""}
                onChange={(e) => handleUpdate({ placeholder: e.target.value })}
                placeholder="Enter placeholder text"
              />
            </div>
          ) : null}

          {(selectedQuestion.type === "multiple-choice" ||
            selectedQuestion.type === "checkbox" ||
            selectedQuestion.type === "dropdown") && (
            <div>
              <Label>Options</Label>
              <div className="space-y-2">
                {selectedQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [
                          ...(selectedQuestion.options || []),
                        ];
                        newOptions[index] = e.target.value;
                        handleUpdate({ options: newOptions });
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newOptions = selectedQuestion.options?.filter(
                          (_, i) => i !== index
                        );
                        handleUpdate({ options: newOptions });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newOptions = [
                      ...(selectedQuestion.options || []),
                      `Option ${(selectedQuestion.options?.length || 0) + 1}`,
                    ];
                    handleUpdate({ options: newOptions });
                  }}
                >
                  Add Option
                </Button>
              </div>
            </div>
          )}

          {selectedQuestion.type === "rating" && (
            <div>
              <Label htmlFor="max-rating">Maximum Rating</Label>
              <Input
                id="max-rating"
                type="number"
                min="2"
                max="10"
                value={selectedQuestion.maxRating || 5}
                onChange={(e) =>
                  handleUpdate({ maxRating: parseInt(e.target.value) })
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
