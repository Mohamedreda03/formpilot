"use client";

import React from "react";
import { Settings } from "lucide-react";
import QuestionEditor from "./question-editor";
import PagePreview from "./page-preview";
import { EmptyState } from "@/components/ui/empty-state";
import { useFormStore } from "@/stores/form-store";

export function MainContent() {
  const { selectedQuestionId, selectedPage, form } = useFormStore();

  if (!form) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={Settings}
          title="No form loaded"
          description="Please select a form to edit"
        />
      </div>
    );
  }

  if (selectedPage) {
    return (
      <div className="flex-1 bg-white border-r border-gray-200">
        <PagePreview pageType={selectedPage} />
      </div>
    );
  }

  if (selectedQuestionId) {
    return (
      <div className="flex-1 bg-white border-r border-gray-200">
        <QuestionEditor />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <EmptyState
          icon={Settings}
          title="Select a question to edit"
          description="Choose a question from the sidebar to start editing"
          actionLabel="Add Question"
          onAction={() => {}}
        />
      </div>
    </div>
  );
}
