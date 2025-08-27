import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { QuestionType } from "@/lib/question-types";

export interface Question {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  order: number;
  required: boolean;
  options?: string[];
  placeholder?: string;
  maxRating?: number;
  acceptedFormats?: string;
}

export interface FormPage {
  id: string;
  title: string;
  order: number;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  pages: FormPage[];
  settings: {
    allowAnonymous: boolean;
    requireEmail: boolean;
    multipleSubmissions: boolean;
    showProgress: boolean;
  };
  introTitle?: string;
  introDescription?: string;
  introButtonText?: string;
  outroTitle?: string;
  outroDescription?: string;
  outroButtonText?: string;
  design?: string; // JSON string containing design data
}

interface FormState {
  form: Form | null;
  selectedQuestionId: string | null;
  selectedPage: "intro" | "outro" | null;
  isLoading: boolean;
  error: string | null;
}

interface FormActions {
  setForm: (form: Form) => void;
  loadForm: (formId: string) => Promise<void>;
  updateForm: (updates: Partial<Form>) => void;
  setSelectedQuestionId: (id: string | null) => void;
  setSelectedPage: (page: "intro" | "outro" | null) => void;
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;
  addQuestion: (question: Omit<Question, "id" | "order">) => void;
  deleteQuestion: (questionId: string) => void;
  reorderQuestions: (questions: Question[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type FormStore = FormState & FormActions;

export const useFormStore = create<FormStore>()(
  devtools(
    persist(
      (set) => ({
        form: null,
        selectedQuestionId: null,
        selectedPage: null,
        isLoading: false,
        error: null,

        setForm: (form) => set({ form }),

        loadForm: async (formId) => {
          set({ isLoading: true, error: null });
          try {
            const mockForm: Form = {
              id: formId,
              title: "Sample Form",
              description: "This is a sample form",
              questions: [
                {
                  id: "q1",
                  title: "What's your name?",
                  description: "",
                  type: "text",
                  order: 1,
                  required: true,
                  placeholder: "Enter your name",
                },
                {
                  id: "q2",
                  title: "How would you rate our service?",
                  description: "",
                  type: "rating",
                  order: 2,
                  required: false,
                  maxRating: 5,
                },
              ],
              pages: [],
              settings: {
                allowAnonymous: true,
                requireEmail: false,
                multipleSubmissions: false,
                showProgress: true,
              },
              introTitle: "Welcome to our survey",
              introDescription:
                "We'd love to hear your thoughts. Please take a few minutes to complete this survey.",
              introButtonText: "Start",
              outroTitle: "Thank you for your time",
              outroDescription:
                "Your responses have been recorded. We appreciate your feedback!",
              outroButtonText: "Submit",
            };

            set({ form: mockForm, isLoading: false });
          } catch (error) {
            set({
              error:
                error instanceof Error ? error.message : "Failed to load form",
              isLoading: false,
            });
          }
        },

        updateForm: (updates) =>
          set((state) => ({
            form: state.form ? { ...state.form, ...updates } : null,
          })),

        setSelectedQuestionId: (id) => set({ selectedQuestionId: id }),

        setSelectedPage: (page) => set({ selectedPage: page }),

        updateQuestion: (questionId, updates) =>
          set((state) => {
            if (!state.form) return state;

            const updatedQuestions = state.form.questions.map((q) =>
              q.id === questionId ? { ...q, ...updates } : q
            );

            return {
              form: { ...state.form, questions: updatedQuestions },
            };
          }),

        addQuestion: (questionData) =>
          set((state) => {
            if (!state.form) return state;

            const newQuestion: Question = {
              ...questionData,
              id: `q_${Date.now()}`,
              order: state.form.questions.length + 1,
            };

            return {
              form: {
                ...state.form,
                questions: [...state.form.questions, newQuestion],
              },
            };
          }),

        deleteQuestion: (questionId) =>
          set((state) => {
            if (!state.form) return state;

            const filteredQuestions = state.form.questions
              .filter((q) => q.id !== questionId)
              .map((q, index) => ({ ...q, order: index + 1 }));

            return {
              form: { ...state.form, questions: filteredQuestions },
              selectedQuestionId:
                state.selectedQuestionId === questionId
                  ? null
                  : state.selectedQuestionId,
            };
          }),

        reorderQuestions: (reorderedQuestions) =>
          set((state) => {
            if (!state.form) return state;

            const questionsWithUpdatedOrder = reorderedQuestions.map(
              (q, index) => ({
                ...q,
                order: index + 1,
              })
            );

            return {
              form: { ...state.form, questions: questionsWithUpdatedOrder },
            };
          }),

        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),
      }),
      {
        name: "form-store",
        partialize: (state) => ({
          form: state.form,
          selectedQuestionId: state.selectedQuestionId,
          selectedPage: state.selectedPage,
        }),
      }
    ),
    { name: "FormStore" }
  )
);

export const useDebouncedFormActions = () => {
  const updateQuestion = useFormStore((state) => state.updateQuestion);
  const updateForm = useFormStore((state) => state.updateForm);

  return {
    updateQuestion,
    updateForm,
  };
};
