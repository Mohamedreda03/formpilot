import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { QuestionType } from "@/lib/question-types";
import { formService } from "@/lib/appwrite-services";
import { FormsService } from "@/lib/forms-service";
import { formDB } from "@/lib/database";
import { toast } from "sonner";

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
  workspaceId?: string; // Workspace ID for navigation
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
  addQuestion: (questionData: Omit<Question, "id" | "order">) => void;
  deleteQuestion: (questionId: string) => void;
  reorderQuestions: (reorderedQuestions: Question[]) => void;
  // New database operations
  duplicateQuestionDB: (questionId: string) => Promise<void>;
  deleteQuestionDB: (questionId: string) => Promise<void>;
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
            // Load form from database
            const dbForm = await formDB.getForm(formId);

            if (!dbForm) {
              throw new Error("Form not found");
            }

            // Parse questions from JSON string
            let questions: Question[] = [];
            try {
              questions = dbForm.questions ? JSON.parse(dbForm.questions) : [];
            } catch (parseError) {
              console.error("Failed to parse questions:", parseError);
              questions = [];
            }

            // Transform database form to our Form interface
            const form: Form = {
              id: dbForm.$id || formId,
              title: dbForm.title,
              description: dbForm.description,
              questions: questions,
              pages: [], // Pages not implemented yet
              settings: {
                allowAnonymous: true,
                requireEmail: false,
                multipleSubmissions: false,
                showProgress: true,
              },
              introTitle: dbForm.introTitle,
              introDescription: dbForm.introDescription,
              introButtonText: dbForm.introButtonText,
              outroTitle: dbForm.outroTitle,
              outroDescription: dbForm.outroDescription,
              outroButtonText: dbForm.outroButtonText,
              workspaceId: dbForm.workspaceId,
              design: dbForm.design,
            };

            // Set form and clear loading/error states
            set({ form, isLoading: false, error: null });
          } catch (error) {
            console.error("Error loading form:", error);
            set({
              error:
                error instanceof Error ? error.message : "Failed to load form",
              isLoading: false,
              form: null,
            });
          }
        },

        updateForm: (updates) =>
          set((state) => {
            if (!state.form) return state;

            const updatedForm = { ...state.form, ...updates };

            // Save to database in the background
            if (state.form.id) {
              // Convert questions to JSON string if needed for database
              const dbUpdates = { ...updates };
              if (dbUpdates.questions) {
                (dbUpdates as any).questions = JSON.stringify(
                  dbUpdates.questions
                );
              }

              formService
                .updateForm(state.form.id, dbUpdates as any)
                .catch((error) => {
                  console.error(
                    "Failed to save form updates to database:",
                    error
                  );
                });
            }

            return { form: updatedForm };
          }),

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

            // If deleting the currently selected question
            const wasSelectedQuestionDeleted =
              state.selectedQuestionId === questionId;
            let newSelectedQuestionId = state.selectedQuestionId;

            if (wasSelectedQuestionDeleted) {
              // Auto-select first available question, or null if no questions remain
              newSelectedQuestionId =
                filteredQuestions.length > 0 ? filteredQuestions[0].id : null;
            }

            return {
              form: { ...state.form, questions: filteredQuestions },
              selectedQuestionId: newSelectedQuestionId,
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

            // Save to database in the background
            if (state.form.id) {
              formService
                .updateForm(state.form.id, {
                  questions: JSON.stringify(questionsWithUpdatedOrder),
                } as any)
                .catch((error) => {
                  console.error(
                    "Failed to save question order to database:",
                    error
                  );
                });
            }

            return {
              form: { ...state.form, questions: questionsWithUpdatedOrder },
            };
          }),

        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),

        // Database operations for questions
        duplicateQuestionDB: async (questionId) => {
          set({ isLoading: true, error: null });
          try {
            const state = useFormStore.getState();
            if (!state.form) {
              throw new Error("No form loaded");
            }

            const questionToDuplicate = state.form.questions.find(
              (q) => q.id === questionId
            );

            if (!questionToDuplicate) {
              throw new Error("Question not found");
            }

            // Create duplicated question data
            const duplicatedQuestion: Omit<Question, "id" | "order"> = {
              type: questionToDuplicate.type,
              title: `${questionToDuplicate.title} (Copy)`,
              description: questionToDuplicate.description,
              required: questionToDuplicate.required,
              options: questionToDuplicate.options,
              placeholder: questionToDuplicate.placeholder,
              maxRating: questionToDuplicate.maxRating,
              acceptedFormats: questionToDuplicate.acceptedFormats,
            };

            // Add new question to local state first
            const newQuestion: Question = {
              ...duplicatedQuestion,
              id: `q_${Date.now()}`,
              order: state.form.questions.length + 1,
            };

            const updatedQuestions = [...state.form.questions, newQuestion];

            // Update local state
            set((state) => ({
              form: state.form
                ? { ...state.form, questions: updatedQuestions }
                : null,
              selectedQuestionId: newQuestion.id, // Select the new question
            }));

            // Update database
            await formService.updateForm(state.form.id, {
              questions: JSON.stringify(updatedQuestions),
            });

            set({ isLoading: false });
            toast.success("Question duplicated successfully!");
          } catch (error) {
            console.error("Failed to duplicate question:", error);
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to duplicate question",
              isLoading: false,
            });
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to duplicate question. Please try again."
            );
          }
        },

        deleteQuestionDB: async (questionId) => {
          set({ isLoading: true, error: null });
          try {
            const state = useFormStore.getState();
            if (!state.form) {
              throw new Error("No form loaded");
            }

            const filteredQuestions = state.form.questions
              .filter((q) => q.id !== questionId)
              .map((q, index) => ({ ...q, order: index + 1 }));

            // If deleting the currently selected question
            const wasSelectedQuestionDeleted =
              state.selectedQuestionId === questionId;
            let newSelectedQuestionId = state.selectedQuestionId;

            if (wasSelectedQuestionDeleted) {
              // Auto-select first available question, or null if no questions remain
              newSelectedQuestionId =
                filteredQuestions.length > 0 ? filteredQuestions[0].id : null;
            }

            // Update local state
            set((state) => ({
              form: state.form
                ? { ...state.form, questions: filteredQuestions }
                : null,
              selectedQuestionId: newSelectedQuestionId,
            }));

            // Update database
            await formService.updateForm(state.form.id, {
              questions: JSON.stringify(filteredQuestions),
            });

            set({ isLoading: false });
            toast.success("Question deleted successfully!");
          } catch (error) {
            console.error("Failed to delete question:", error);
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to delete question",
              isLoading: false,
            });
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to delete question. Please try again."
            );
          }
        },
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
