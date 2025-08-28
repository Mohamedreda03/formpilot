"use client";

import React from "react";
import { Settings, MessageSquare } from "lucide-react";
import PagePreview from "./page-preview";
import { EmptyState } from "@/components/ui/empty-state";
import { useFormStore } from "@/stores/form-store";
import { useFormDesign } from "@/hooks/use-form-design";
import QuestionPreview from "./question-preview";

export function MainContent() {
  const { selectedQuestionId, selectedPage, form, setSelectedQuestionId } =
    useFormStore();
  const { getContainerStyles } = useFormDesign();

  if (!form) {
    return (
      <div className="flex-1 bg-gray-50 p-4 flex items-center justify-center h-full overflow-hidden">
        <div
          className="h-full w-full border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center"
          style={getContainerStyles(false)}
        >
          <EmptyState
            icon={Settings}
            title="No form loaded"
            description="Please select a form to edit"
          />
        </div>
      </div>
    );
  }

  if (selectedPage) {
    return (
      <div className="flex-1 bg-gray-50 h-full overflow-hidden">
        <PagePreview pageType={selectedPage} />
      </div>
    );
  }

  if (selectedQuestionId) {
    const selectedQuestion = form.questions.find(
      (q) => q.id === selectedQuestionId
    );

    // If selected question not found, auto-select first question instead of showing error
    if (!selectedQuestion && form.questions.length > 0) {
      setSelectedQuestionId(form.questions[0].id);
      return null; // Will re-render with first question selected
    }

    // If no questions exist at all
    if (!selectedQuestion) {
      return (
        <div className="flex-1 bg-gray-50 p-4 flex items-center justify-center h-full overflow-hidden">
          <div
            className="h-full w-full border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center"
            style={getContainerStyles(false)}
          >
            <EmptyState
              icon={MessageSquare}
              title="No questions yet"
              description="Add your first question to get started"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 bg-gray-50 h-full overflow-hidden">
        <QuestionPreview question={selectedQuestion} />
      </div>
    );
  }

  // Default state - if no selection and questions exist, this shouldn't happen due to auto-select
  // But if no questions exist, show helpful message
  if (form.questions.length === 0) {
    return (
      <div className="flex-1 bg-gray-50 p-4 flex items-center justify-center h-full overflow-hidden">
        <div
          className="h-full w-full border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center"
          style={getContainerStyles(false)}
        >
          <EmptyState
            icon={MessageSquare}
            title="No questions yet"
            description="Add your first question to get started"
          />
        </div>
      </div>
    );
  }

  // This should rarely happen due to auto-select logic
  return (
    <div className="flex-1 bg-gray-50 p-4 flex items-center justify-center h-full overflow-hidden">
      <div
        className="h-full w-full border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center"
        style={getContainerStyles(false)}
      >
        <EmptyState
          icon={MessageSquare}
          title="Select a question or page"
          description="Choose a question from the sidebar or select a page to start editing"
        />
      </div>
    </div>
  );
}
