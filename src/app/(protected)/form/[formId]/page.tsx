"use client";

import React, { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import QuestionsSidebar from "./components/questions-sidebar";
import SettingsSidebar from "./components/settings-sidebar";
import QuestionTypePicker from "./components/question-type-picker";
import ContentToolbar from "./components/content-toolbar";
import { QuestionType } from "@/lib/question-types";
import { MainContent } from "./components/main-content";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { useFormStore, Question } from "@/stores/form-store";
import { MobileOverlay } from "@/components/ui/mobile-overlay";

export default function FormEditPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const router = useRouter();
  const { formId } = use(params);

  const {
    form,
    isLoading,
    error,
    selectedQuestionId,
    selectedPage,
    loadForm,
    setSelectedQuestionId,
    setSelectedPage,
    addQuestion,
    deleteQuestion,
    reorderQuestions,
    // New database operations
    duplicateQuestionDB,
    deleteQuestionDB,
  } = useFormStore();

  const [showQuestionTypePicker, setShowQuestionTypePicker] =
    React.useState(false);

  const [initialLoadComplete, setInitialLoadComplete] = React.useState(false);

  useEffect(() => {
    if (!formId || formId === "new") return;

    const loadFormData = async () => {
      try {
        await loadForm(formId);
        setInitialLoadComplete(true);
      } catch (error) {
        console.error("Failed to load form:", error);
        setInitialLoadComplete(true);
      }
    };

    loadFormData();
  }, [formId, loadForm]);

  // Auto-select first question when form loads and no selection exists
  useEffect(() => {
    if (
      form &&
      initialLoadComplete &&
      !selectedQuestionId &&
      !selectedPage &&
      form.questions.length > 0
    ) {
      // Automatically select the first question
      setSelectedQuestionId(form.questions[0].id);
    }
  }, [
    form,
    initialLoadComplete,
    selectedQuestionId,
    selectedPage,
    setSelectedQuestionId,
  ]);

  // Show loading only during initial load
  if (isLoading && !initialLoadComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error only if we've completed initial load and there's an error
  if (error && initialLoadComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  // Show form not found only if we've completed initial load and there's no form
  if (!form && initialLoadComplete && !isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ErrorMessage message="Form not found" />
      </div>
    );
  }

  // If still loading or form not ready, show loading
  if (!form || !initialLoadComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const handleQuestionSelect = (questionId: string) => {
    setSelectedQuestionId(questionId);
    setSelectedPage(null); // Clear page selection when selecting a question
  };

  const handlePageSelect = (page: "intro" | "outro") => {
    setSelectedPage(page);
    setSelectedQuestionId(null); // Clear question selection when selecting a page
  };

  const handleAddQuestion = () => {
    setShowQuestionTypePicker(true);
  };

  const handleQuestionDuplicate = async (questionId: string) => {
    try {
      await duplicateQuestionDB(questionId);
    } catch (error) {
      console.error("Failed to duplicate question:", error);
      // Error handling is already done in the store
    }
  };

  const handleSelectQuestionType = (type: QuestionType) => {
    try {
      const newQuestion: Omit<Question, "id" | "order"> = {
        type: type,
        title: "Click to edit question text...",
        required: false,
        options: ["multiple-choice", "checkbox", "dropdown"].includes(type)
          ? ["Option 1", "Option 2"]
          : undefined,
      };

      addQuestion(newQuestion);
      setShowQuestionTypePicker(false);
    } catch (error) {
      console.error("Failed to add question:", error);
    }
  };

  const handleQuestionDelete = async (questionId: string) => {
    try {
      await deleteQuestionDB(questionId);
    } catch (error) {
      console.error("Failed to delete question:", error);
      // Error handling is already done in the store
    }
  };

  const handleQuestionsReorder = (reorderedQuestions: Question[]) => {
    try {
      reorderQuestions(reorderedQuestions);
    } catch (error) {
      console.error("Failed to reorder questions:", error);
    }
  };

  const introPage = {
    id: "intro",
    type: "intro" as const,
    title: form.introTitle || "Welcome",
    description: form.introDescription || "Please fill out this form",
    buttonText: form.introButtonText || "Start",
  };

  const outroPage = {
    id: "outro",
    type: "outro" as const,
    title: form.outroTitle || "Thank you",
    description: form.outroDescription || "Your response has been submitted",
    buttonText: form.outroButtonText || "Submit",
  };

  return (
    <>
      {/* Mobile Screen Overlay */}
      <MobileOverlay />

      {/* Main Content - Hidden on Mobile */}
      <div className="hidden lg:flex h-[calc(100vh-60px)] overflow-hidden bg-gray-50">
        <QuestionsSidebar
          questions={form.questions}
          selectedQuestionId={selectedQuestionId || undefined}
          selectedPage={selectedPage}
          onQuestionSelect={handleQuestionSelect}
          onPageSelect={handlePageSelect}
          onQuestionDuplicate={handleQuestionDuplicate}
          onQuestionDelete={handleQuestionDelete}
          onAddQuestion={handleAddQuestion}
          onQuestionsReorder={handleQuestionsReorder}
          introPage={introPage}
          outroPage={outroPage}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <ContentToolbar onAddContent={handleAddQuestion} />
          <div className="flex-1 overflow-hidden">
            <MainContent />
          </div>
        </div>

        <SettingsSidebar />

        <QuestionTypePicker
          isOpen={showQuestionTypePicker}
          onClose={() => setShowQuestionTypePicker(false)}
          onSelectType={handleSelectQuestionType}
        />
      </div>
    </>
  );
}
