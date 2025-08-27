"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FormsService,
  FormData,
  Question,
  PageData,
} from "@/lib/forms-service";
import { useAuth } from "./use-auth";

export function useForm(formId: string) {
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Load form data
  useEffect(() => {
    if (!formId || formId === "new") return;

    const loadForm = async () => {
      try {
        setLoading(true);
        setError(null);
        const formData = await FormsService.getById(formId);
        setForm(formData);
      } catch (err: any) {
        setError(err.message || "Failed to load form");
        console.error("Error loading form:", err);
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [formId]);

  // Create new form
  const createForm = async (title: string, description?: string) => {
    if (!user) throw new Error("User not authenticated");

    try {
      setSaving(true);
      const newForm = await FormsService.create({
        title,
        description,
        questions: [],
        userId: user.$id,
      });
      setForm(newForm);
      router.push(`/form/${newForm.id}`);
      return newForm;
    } catch (err: any) {
      setError(err.message || "Failed to create form");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Update form basic info
  const updateForm = async (updates: Partial<FormData>) => {
    if (!form) return;

    try {
      setSaving(true);
      const updatedForm = await FormsService.update(form.id!, updates);
      setForm(updatedForm);
      return updatedForm;
    } catch (err: any) {
      setError(err.message || "Failed to update form");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Update questions
  const updateQuestions = async (questions: Question[]) => {
    if (!form) return;

    // Update local state immediately for better UX
    const tempForm = { ...form, questions };
    setForm(tempForm);

    try {
      const updatedForm = await FormsService.updateQuestionOrder(
        form.id!,
        questions
      );
      setForm(updatedForm);
      return updatedForm;
    } catch (err: any) {
      // Revert local state on error
      setForm(form);
      setError(err.message || "Failed to update questions");
      throw err;
    }
  };

  // Update single question
  const updateQuestion = async (
    questionId: string,
    updates: Partial<Question>
  ) => {
    if (!form) return;

    const updatedQuestions = form.questions.map((q) =>
      q.id === questionId ? { ...q, ...updates } : q
    );

    return updateQuestions(updatedQuestions);
  };

  // Add question
  const addQuestion = async (question: Question) => {
    if (!form) return;

    const updatedQuestions = [...form.questions, question];
    return updateQuestions(updatedQuestions);
  };

  // Delete question
  const deleteQuestion = async (questionId: string) => {
    if (!form) return;

    const updatedQuestions = form.questions.filter((q) => q.id !== questionId);
    return updateQuestions(updatedQuestions);
  };

  // Duplicate question
  const duplicateQuestion = async (questionId: string) => {
    if (!form) return;

    const questionToDuplicate = form.questions.find((q) => q.id === questionId);
    if (!questionToDuplicate) return;

    const newQuestion: Question = {
      ...questionToDuplicate,
      id: `${questionId}_copy_${Date.now()}`,
      title: `${questionToDuplicate.title} (Copy)`,
      order: Math.max(...form.questions.map((q) => q.order)) + 1,
    };

    return addQuestion(newQuestion);
  };

  // Reorder questions
  const reorderQuestions = async (questions: Question[]) => {
    if (!form) return;

    // Update order values
    const updatedQuestions = questions.map((question, index) => ({
      ...question,
      order: index + 1,
    }));

    return updateQuestions(updatedQuestions);
  };

  // Update intro page
  const updateIntroPage = async (introData: PageData) => {
    if (!form) return;

    // Update local state immediately for better UX
    const tempForm = {
      ...form,
      introTitle: introData.title,
      introDescription: introData.description,
      introButtonText: introData.buttonText,
    };
    setForm(tempForm);

    try {
      const updatedForm = await FormsService.updateIntroPage(
        form.id!,
        introData
      );
      setForm(updatedForm);
      return updatedForm;
    } catch (err: any) {
      // Revert local state on error
      setForm(form);
      setError(err.message || "Failed to update intro page");
      throw err;
    }
  };

  // Update outro page
  const updateOutroPage = async (outroData: PageData) => {
    if (!form) return;

    // Update local state immediately for better UX
    const tempForm = {
      ...form,
      outroTitle: outroData.title,
      outroDescription: outroData.description,
      outroButtonText: outroData.buttonText,
    };
    setForm(tempForm);

    try {
      const updatedForm = await FormsService.updateOutroPage(
        form.id!,
        outroData
      );
      setForm(updatedForm);
      return updatedForm;
    } catch (err: any) {
      // Revert local state on error
      setForm(form);
      setError(err.message || "Failed to update outro page");
      throw err;
    }
  };

  // Delete form
  const deleteForm = async () => {
    if (!form) return;

    try {
      setSaving(true);
      await FormsService.delete(form.id!);
      router.push("/ws");
    } catch (err: any) {
      setError(err.message || "Failed to delete form");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    loading,
    error,
    saving,
    createForm,
    updateForm,
    updateQuestion,
    addQuestion,
    deleteQuestion,
    duplicateQuestion,
    reorderQuestions,
    updateIntroPage,
    updateOutroPage,
    deleteForm,
  };
}

export function useForms() {
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load user forms
  useEffect(() => {
    if (!user) return;

    const loadForms = async () => {
      try {
        setLoading(true);
        setError(null);
        const userForms = await FormsService.getByUser(user.$id);
        setForms(userForms);
      } catch (err: any) {
        setError(err.message || "Failed to load forms");
        console.error("Error loading forms:", err);
      } finally {
        setLoading(false);
      }
    };

    loadForms();
  }, [user]);

  return {
    forms,
    loading,
    error,
    refetch: () => {
      if (user) {
        FormsService.getByUser(user.$id).then(setForms);
      }
    },
  };
}
