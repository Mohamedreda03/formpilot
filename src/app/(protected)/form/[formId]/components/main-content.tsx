"use client";

import React from "react";
import { Settings, MessageSquare } from "lucide-react";
import PagePreview from "./page-preview";
import { EmptyState } from "@/components/ui/empty-state";
import { useFormStore } from "@/stores/form-store";
import QuestionPreview from "./question-preview";

export function MainContent() {
  const { selectedQuestionId, selectedPage, form } = useFormStore();

  if (!form) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center h-full overflow-hidden">
        <div className="h-full w-full border-2 border-dashed border-gray-300 rounded-2xl bg-white flex items-center justify-center">
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

    if (!selectedQuestion) {
      return (
        <div className="flex-1 bg-gray-50 flex items-center justify-center h-full overflow-hidden">
          <div className="h-full w-full border-2 border-dashed border-gray-300 rounded-2xl bg-white flex items-center justify-center">
            <EmptyState
              icon={MessageSquare}
              title="Question not found"
              description="The selected question could not be found"
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

  // Default state - no selection
  return (
    <div className="flex-1 bg-gray-50 flex items-center justify-center h-full overflow-hidden">
      <div className="h-full w-full border-2 border-dashed border-gray-300 rounded-2xl bg-white flex items-center justify-center">
        <EmptyState
          icon={MessageSquare}
          title="Select a question or page"
          description="Choose a question from the sidebar or select a page to start editing"
        />
      </div>
    </div>
  );
}
