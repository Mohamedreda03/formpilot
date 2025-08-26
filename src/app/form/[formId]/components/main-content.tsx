"use client";

import React from "react";
import { Settings } from "lucide-react";
import QuestionEditor from "./question-editor";
import PagePreview from "./page-preview";
import { EmptyState } from "@/components/ui/empty-state";
import { AddQuestionButton } from "@/components/ui/add-question-button";
import { useFormStore } from "@/stores/form-store";

interface MainContentProps {
  // No props needed since components use global store
}

export function MainContent({}: MainContentProps) {
  // Get state from Zustand store
  const { selectedQuestionId, selectedPage, selectPage, form } = useFormStore();

  if (selectedQuestionId) {
    return (
      <div className="flex-1 overflow-y-auto">
        <QuestionEditor />
      </div>
    );
  }

  if (selectedPage) {
    return (
      <div className="flex-1 overflow-y-auto">
        <PagePreview
          pageType={selectedPage}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <EmptyState
          icon={Settings}
          title={
            (form?.questions.length || 0) === 0
              ? "No Questions Yet"
              : `${form?.questions.length || 0} Questions`
          }
          description={
            (form?.questions.length || 0) === 0
              ? "Add your first question to get started"
              : "Select a question, intro page, or outro page from the sidebar to edit"
          }
        />
        <div className="mt-4">
          <AddQuestionButton onClick={() => {
            // Add logic to show question type picker
          }} />
        </div>
      </div>
    </div>
  );
}
