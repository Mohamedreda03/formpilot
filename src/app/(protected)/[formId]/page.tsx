"use client";

import React, { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import QuestionsSidebar from "./components/questions-sidebar";
import SettingsSidebar from "./components/settings-sidebar";
import QuestionTypePicker, {
  Question,
  QuestionType,
} from "./components/question-type-picker";
import { FormHeader } from "@/components/ui/form-header";
import { MainContent } from "./components/main-content";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { useFormStore } from "@/stores/form-store";

export default function FormEditPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const router = useRouter();
  const { formId } = use(params);

  // Get state and actions from Zustand store
  const {
    form,
    loading,
    error,
    selectedQuestionId,
    selectedPage,
    loadForm,
    selectQuestion,
    selectPage,
    addQuestion,
    deleteQuestion,
    duplicateQuestion,
    reorderQuestions,
    updateQuestion,
    updateIntroPage,
    updateOutroPage,
  } = useFormStore();

  // Local state for UI components
  const [showQuestionTypePicker, setShowQuestionTypePicker] =
    React.useState(false);

  // Load form data on mount
  useEffect(() => {
    if (!formId || formId === "new") return;
    loadForm(formId);
  }, [formId, loadForm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ErrorMessage
          title="Failed to load form"
          message={error || "Form not found"}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const handleQuestionSelect = (questionId: string) => {
    selectQuestion(questionId);
  };

  const handlePageSelect = (page: "intro" | "outro") => {
    selectPage(page);
  };

  const handleQuestionsReorder = async (reorderedQuestions: Question[]) => {
    try {
      await reorderQuestions(reorderedQuestions);
    } catch (error) {
      console.error("Failed to reorder questions:", error);
    }
  };

  const handleQuestionDuplicate = async (questionId: string) => {
    try {
      await duplicateQuestion(questionId);
    } catch (error) {
      console.error("Failed to duplicate question:", error);
    }
  };

  const handleAddQuestion = () => {
    setShowQuestionTypePicker(true);
  };

  const handleSelectQuestionType = async (type: QuestionType) => {
    try {
      const newQuestion: Question = {
        id: `question_${Date.now()}`,
        type: type,
        title: "Click to edit question text...",
        required: false,
        order:
          Math.max(
            ...(form.questions.length > 0
              ? form.questions.map((q) => q.order)
              : [0])
          ) + 1,
        options: ["multiple-choice", "checkbox", "dropdown"].includes(type)
          ? ["Option 1", "Option 2"]
          : undefined,
      };

      await addQuestion(newQuestion);
      selectQuestion(newQuestion.id);
      setShowQuestionTypePicker(false);
    } catch (error) {
      console.error("Failed to add question:", error);
    }
  };

  const handleQuestionDelete = async (questionId: string) => {
    try {
      await deleteQuestion(questionId);
      if (selectedQuestionId === questionId) {
        selectQuestion(null);
      }
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };

  const handleUpdateQuestion = async (updates: Partial<Question>) => {
    if (!selectedQuestionId) return;

    try {
      await updateQuestion(selectedQuestionId, updates);
    } catch (error) {
      console.error("Failed to update question:", error);
    }
  };

  const handleChangeQuestionType = async (
    questionId: string,
    newType: QuestionType
  ) => {
    try {
      const updates: Partial<Question> = {
        type: newType,
        // Reset type-specific properties when changing type
        placeholder: undefined,
        options:
          newType === "multiple-choice" ||
          newType === "checkbox" ||
          newType === "dropdown"
            ? ["Option 1", "Option 2"]
            : undefined,
        maxRating: newType === "rating" ? 5 : undefined,
        acceptedFormats: undefined,
      };
      await updateQuestion(questionId, updates);
    } catch (error) {
      console.error("Failed to change question type:", error);
    }
  };

  const handleUpdatePage = async (page: "intro" | "outro", updates: any) => {
    try {
      if (page === "intro") {
        await updateIntroPage({
          title:
            updates.title !== undefined ? updates.title : form.introTitle || "",
          description:
            updates.description !== undefined
              ? updates.description
              : form.introDescription || "",
          buttonText:
            updates.buttonText !== undefined
              ? updates.buttonText
              : form.introButtonText || "",
        });
      } else {
        await updateOutroPage({
          title:
            updates.title !== undefined ? updates.title : form.outroTitle || "",
          description:
            updates.description !== undefined
              ? updates.description
              : form.outroDescription || "",
          buttonText:
            updates.buttonText !== undefined
              ? updates.buttonText
              : form.outroButtonText || "",
        });
      }
    } catch (error) {
      console.error("Failed to update page:", error);
    }
  };

  const selectedQuestion = selectedQuestionId
    ? form.questions.find((q) => q.id === selectedQuestionId)
    : null;

  const introPage = {
    title: form.introTitle || "Welcome to our survey",
    description:
      form.introDescription ||
      "We'd love to hear your thoughts. Please take a few minutes to complete this survey.",
    buttonText: form.introButtonText || "Start",
  };

  const outroPage = {
    title: form.outroTitle || "Thank you for your time",
    description:
      form.outroDescription ||
      "Your responses have been recorded. We appreciate your feedback!",
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
          onQuestionsReorder={handleQuestionsReorder}
          onAddQuestion={handleAddQuestion}
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
