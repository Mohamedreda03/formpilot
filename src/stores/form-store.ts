"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { FormData, Question, PageData } from "@/lib/forms-service";
import { QuestionType } from "@/app/form/[formId]/components/question-type-picker";
import { FormsService } from "@/lib/forms-service";
import { useDebouncedUpdate } from "@/hooks/use-debounced-update";

interface FormState {
  // State
  form: FormData | null;
  loading: boolean;
  error: string | null;
  saving: boolean;

  // Selected items
  selectedQuestionId: string | null;
  selectedPage: "intro" | "outro" | null;

  // Actions
  setForm: (form: FormData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSaving: (saving: boolean) => void;

  // Selection actions
  selectQuestion: (questionId: string | null) => void;
  selectPage: (page: "intro" | "outro" | null) => void;

  // Question actions
  changeQuestionType: (questionId: string, newType: QuestionType) => void;
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;
  addQuestion: (question: Question) => void;
  deleteQuestion: (questionId: string) => void;
  duplicateQuestion: (questionId: string) => void;
  reorderQuestions: (questions: Question[]) => void;

  // Page actions
  updateIntroPage: (updates: Partial<PageData>) => void;
  updateOutroPage: (updates: Partial<PageData>) => void;

  // API actions
  loadForm: (formId: string) => Promise<void>;
  saveQuestion: (
    questionId: string,
    updates: Partial<Question>
  ) => Promise<void>;
  saveIntroPage: (updates: PageData) => Promise<void>;
  saveOutroPage: (updates: PageData) => Promise<void>;
}

export const useFormStore = create<FormState>()(
  devtools(
    (set, get) => ({
      // Initial state
      form: null,
      loading: false,
      error: null,
      saving: false,
      selectedQuestionId: null,
      selectedPage: null,

      // Basic state setters
      setForm: (form) => set({ form }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setSaving: (saving) => set({ saving }),

      // Selection actions
      selectQuestion: (questionId) =>
        set({
          selectedQuestionId: questionId,
          selectedPage: null,
        }),
      selectPage: (page) =>
        set({
          selectedPage: page,
          selectedQuestionId: null,
        }),

      // Question actions - immediate state updates
      changeQuestionType: (questionId, newType) => {
        const { form } = get();
        if (!form) return;

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

        const updatedQuestions = form.questions.map((q) =>
          q.id === questionId ? { ...q, ...updates } : q
        );

        set({
          form: {
            ...form,
            questions: updatedQuestions,
          },
        });
      },

      updateQuestion: (questionId, updates) => {
        const { form } = get();
        if (!form) return;

        const updatedQuestions = form.questions.map((q) =>
          q.id === questionId ? { ...q, ...updates } : q
        );

        set({
          form: {
            ...form,
            questions: updatedQuestions,
          },
        });
      },

      addQuestion: (question) => {
        const { form } = get();
        if (!form) return;

        set({
          form: {
            ...form,
            questions: [...form.questions, question],
          },
        });
      },

      deleteQuestion: (questionId) => {
        const { form, selectedQuestionId } = get();
        if (!form) return;

        const updatedQuestions = form.questions.filter(
          (q) => q.id !== questionId
        );

        set({
          form: {
            ...form,
            questions: updatedQuestions,
          },
          selectedQuestionId:
            selectedQuestionId === questionId ? null : selectedQuestionId,
        });
      },

      duplicateQuestion: (questionId) => {
        const { form } = get();
        if (!form) return;

        const questionToDuplicate = form.questions.find(
          (q) => q.id === questionId
        );
        if (!questionToDuplicate) return;

        const newQuestion: Question = {
          ...questionToDuplicate,
          id: `${questionId}_copy_${Date.now()}`,
          title: `${questionToDuplicate.title} (Copy)`,
          order: Math.max(...form.questions.map((q) => q.order)) + 1,
        };

        set({
          form: {
            ...form,
            questions: [...form.questions, newQuestion],
          },
        });
      },

      reorderQuestions: (questions) => {
        const { form } = get();
        if (!form) return;

        set({
          form: {
            ...form,
            questions,
          },
        });
      },

      // Page actions - immediate state updates
      updateIntroPage: (updates) => {
        const { form } = get();
        if (!form) return;

        set({
          form: {
            ...form,
            introTitle:
              updates.title !== undefined ? updates.title : form.introTitle,
            introDescription:
              updates.description !== undefined
                ? updates.description
                : form.introDescription,
            introButtonText:
              updates.buttonText !== undefined
                ? updates.buttonText
                : form.introButtonText,
          },
        });
      },

      updateOutroPage: (updates) => {
        const { form } = get();
        if (!form) return;

        set({
          form: {
            ...form,
            outroTitle:
              updates.title !== undefined ? updates.title : form.outroTitle,
            outroDescription:
              updates.description !== undefined
                ? updates.description
                : form.outroDescription,
            outroButtonText:
              updates.buttonText !== undefined
                ? updates.buttonText
                : form.outroButtonText,
          },
        });
      },

      // API actions
      loadForm: async (formId) => {
        try {
          set({ loading: true, error: null });
          const formData = await FormsService.getById(formId);
          set({ form: formData, loading: false });
        } catch (error: any) {
          set({
            error: error.message || "Failed to load form",
            loading: false,
          });
        }
      },

      saveQuestion: async (questionId, updates) => {
        const { form } = get();
        if (!form) return;

        try {
          set({ saving: true });
          const updatedQuestions = form.questions.map((q) =>
            q.id === questionId ? { ...q, ...updates } : q
          );

          await FormsService.updateQuestionOrder(form.id!, updatedQuestions);
          set({ saving: false });
        } catch (error: any) {
          set({
            error: error.message || "Failed to save question",
            saving: false,
          });
          throw error;
        }
      },

      saveIntroPage: async (pageData) => {
        const { form } = get();
        if (!form) return;

        try {
          set({ saving: true });
          await FormsService.updateIntroPage(form.id!, pageData);
          set({ saving: false });
        } catch (error: any) {
          set({
            error: error.message || "Failed to save intro page",
            saving: false,
          });
          throw error;
        }
      },

      saveOutroPage: async (pageData) => {
        const { form } = get();
        if (!form) return;

        try {
          set({ saving: true });
          await FormsService.updateOutroPage(form.id!, pageData);
          set({ saving: false });
        } catch (error: any) {
          set({
            error: error.message || "Failed to save outro page",
            saving: false,
          });
          throw error;
        }
      },
    }),
    {
      name: "form-store",
    }
  )
);

// Debounced hooks for auto-saving
export const useDebouncedFormActions = () => {
  const { saveQuestion, saveIntroPage, saveOutroPage } = useFormStore();

  const debouncedSaveQuestion = useDebouncedUpdate(
    (data: { questionId: string; updates: Partial<Question> }) => {
      saveQuestion(data.questionId, data.updates);
    },
    1000
  );

  const debouncedSaveIntro = useDebouncedUpdate((pageData: PageData) => {
    saveIntroPage(pageData);
  }, 1000);

  const debouncedSaveOutro = useDebouncedUpdate((pageData: PageData) => {
    saveOutroPage(pageData);
  }, 1000);

  return {
    debouncedSaveQuestion,
    debouncedSaveIntro,
    debouncedSaveOutro,
  };
};
