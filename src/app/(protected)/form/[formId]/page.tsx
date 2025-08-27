"use client";

import React, { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import QuestionsSidebar from "./components/questions-sidebar";
import SettingsSidebar from "./components/settings-sidebar";
import QuestionTypePicker, {
  QuestionType,
} from "./components/question-type-picker";
import { FormHeader } from "@/components/ui/form-header";
import { MainContent } from "./components/main-content";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { useFormStore, Question } from "@/stores/form-store";

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
  } = useFormStore();

  const [showQuestionTypePicker, setShowQuestionTypePicker] =
    React.useState(false);

  useEffect(() => {
    if (!formId || formId === "new") return;
    loadForm(formId);
  }, [formId, loadForm]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ErrorMessage message="Form not found" />
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

  const handleQuestionDuplicate = (questionId: string) => {
    try {
      const questionToDuplicate = form.questions.find(
        (q) => q.id === questionId
      );

      if (questionToDuplicate) {
        const duplicatedQuestion: Omit<Question, "id" | "order"> = {
          type: questionToDuplicate.type,
          title: questionToDuplicate.title,
          description: questionToDuplicate.description,
          required: questionToDuplicate.required,
          options: questionToDuplicate.options,
          placeholder: questionToDuplicate.placeholder,
          maxRating: questionToDuplicate.maxRating,
          acceptedFormats: questionToDuplicate.acceptedFormats,
        };

        addQuestion(duplicatedQuestion);
      }
    } catch (error) {
      console.error("Failed to duplicate question:", error);
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

  const handleQuestionDelete = (questionId: string) => {
    try {
      deleteQuestion(questionId);
    } catch (error) {
      console.error("Failed to delete question:", error);
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
    <div className="min-h-screen bg-background">
      <FormHeader
        title={form.title}
        onBack={() => router.back()}
        onPreview={() => {}}
        onSettings={() => {}}
        onShare={() => {}}
        onSave={() => {}}
      />

      <div className="flex h-[calc(100vh-73px)]">
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

        <MainContent />

        <SettingsSidebar />
      </div>

      <QuestionTypePicker
        isOpen={showQuestionTypePicker}
        onClose={() => setShowQuestionTypePicker(false)}
        onSelectType={handleSelectQuestionType}
      />
    </div>
  );
}
