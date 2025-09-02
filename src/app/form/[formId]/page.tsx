"use client";

import React, { useState, useEffect } from "react";
import { use } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { toast } from "sonner";
import { formService, submissionService } from "@/lib/appwrite-services";
import { useFormDesign } from "@/hooks/use-form-design";
import FormQuestionRenderer from "./components/form-question-renderer";
import FormPageRenderer from "./components/form-page-renderer";

export interface FormResponse {
  questionId: string;
  answer: any;
}

export default function PublicFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);
  const [form, setForm] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0); // 0 = intro, 1-n = questions, n+1 = outro
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { getContainerStyles, design } = useFormDesign();

  // Prevent scroll on body when component mounts
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    document.documentElement.style.height = "100vh";

    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.documentElement.style.height = "";
    };
  }, []);

  useEffect(() => {
    const loadForm = async () => {
      try {
        setIsLoading(true);
        const formData = await formService.getForm(formId);
        setForm(formData);
      } catch (err: any) {
        console.error("Failed to load form:", err);
        setError("Form not found or no longer available");
      } finally {
        setIsLoading(false);
      }
    };

    if (formId) {
      loadForm();
    }
  }, [formId]);

  const handleAnswerUpdate = (questionId: string, answer: any) => {
    setResponses((prev) => {
      const existing = prev.find((r) => r.questionId === questionId);
      if (existing) {
        return prev.map((r) =>
          r.questionId === questionId ? { ...r, answer } : r
        );
      }
      return [...prev, { questionId, answer }];
    });
  };

  const getCurrentQuestion = () => {
    if (!form || currentStep === 0 || currentStep > form.questions.length) {
      return null;
    }
    return form.questions[currentStep - 1];
  };

  const getCurrentAnswer = (questionId: string) => {
    return responses.find((r) => r.questionId === questionId)?.answer;
  };

  const canProceed = () => {
    if (currentStep === 0) return true; // Intro page
    if (currentStep > form.questions.length) return true; // Outro page

    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return false;

    if (currentQuestion.required) {
      const answer = getCurrentAnswer(currentQuestion.id);
      return answer !== undefined && answer !== "" && answer !== null;
    }

    return true;
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast.error("Please answer this question before continuing");
      return;
    }

    if (currentStep < form.questions.length + 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Submit responses to database
      await submissionService.submitForm({
        formId: formId,
        responses: responses,
        userInfo: {
          userAgent: navigator.userAgent,
        },
      });

      toast.success(
        "Thank you! Your response has been submitted successfully."
      );

      // Move to thank you page
      setCurrentStep(form.questions.length + 1);
    } catch (err: any) {
      console.error("Failed to submit form:", err);
      toast.error("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ErrorMessage message={error || "Form not found"} />
      </div>
    );
  }

  const totalSteps = form.questions.length + 2; // intro + questions + outro
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div
      className="h-screen overflow-hidden bg-gray-50"
      style={{ maxHeight: "100vh" }}
    >
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="h-1 bg-gray-200">
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
              backgroundColor: design.primaryColor,
            }}
          />
        </div>
      </div>

      <div className="h-full" style={{ height: "100vh", paddingTop: "1px" }}>
        {/* Intro Page */}
        {currentStep === 0 && (
          <FormPageRenderer pageType="intro" form={form} onNext={handleNext} />
        )}

        {/* Questions */}
        {currentStep > 0 && currentStep <= form.questions.length && (
          <div
            className="h-full flex items-center justify-center px-4"
            style={getContainerStyles(true)}
          >
            <div className="w-full max-w-4xl">
              <FormQuestionRenderer
                question={getCurrentQuestion()!}
                answer={getCurrentAnswer(getCurrentQuestion()!.id)}
                onAnswerChange={(answer: any) =>
                  handleAnswerUpdate(getCurrentQuestion()!.id, answer)
                }
                questionNumber={currentStep}
                totalQuestions={form.questions.length}
                onNext={handleNext}
                canProceed={canProceed()}
                onSubmit={
                  currentStep === form.questions.length
                    ? handleSubmit
                    : undefined
                }
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        )}

        {/* Thank You Page */}
        {currentStep > form.questions.length && (
          <FormPageRenderer
            pageType="outro"
            form={form}
            onNext={() => {
              // يمكن إضافة منطق إضافي هنا مثل إعادة توجيه
              setCurrentStep(0); // إعادة تشغيل النموذج
            }}
          />
        )}
      </div>
    </div>
  );
}
