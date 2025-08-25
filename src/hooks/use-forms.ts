"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formService, type Form } from "@/lib/appwrite-services";
import { mockForms } from "@/lib/mock-data";

export const useForms = (workspaceId: string) => {
  return useQuery({
    queryKey: ["forms", workspaceId],
    queryFn: async () => {
      try {
        // Temporarily disabled: return await formService.getForms(workspaceId);
        // Using mock data until ownerId attribute is added to Appwrite
        console.warn(
          "Using mock data - ownerId attribute not configured in Appwrite"
        );
        return mockForms.filter((form) => form.workspaceId === workspaceId);
      } catch (error: any) {
        console.warn("Using mock data due to Appwrite error:", error.message);
        return mockForms.filter((form) => form.workspaceId === workspaceId);
      }
    },
    enabled: !!workspaceId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });
};

export const useCreateForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      workspaceId: string;
    }) => {
      // Temporarily disabled: return formService.createForm(data);
      // Simulate creating form with mock data
      console.warn("Simulating form creation - using mock data");
      const newForm = {
        $id: `mock-form-${Date.now()}`,
        name: data.name,
        description: data.description || "",
        workspaceId: data.workspaceId,
        ownerId: "mock-user",
        status: "active" as const,
        submissions: 0,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
      };
      return Promise.resolve(newForm);
    },
    onSuccess: (newForm) => {
      // Invalidate forms for the specific workspace
      queryClient.invalidateQueries({
        queryKey: ["forms", newForm.workspaceId],
      });
    },
  });
};

export const useUpdateForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      formId,
      data,
    }: {
      formId: string;
      data: Partial<Omit<Form, "$id" | "$createdAt" | "$updatedAt">>;
    }) => {
      // Temporarily disabled: return formService.updateForm(formId, data);
      console.warn("Simulating form update - using mock data");
      return Promise.resolve({ ...data, $id: formId } as Form);
    },
    onSuccess: (updatedForm) => {
      // Update the specific form in cache
      queryClient.setQueryData(["form", updatedForm.$id], updatedForm);
      // Invalidate forms list to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });
};

export const useDeleteForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formId: string) => {
      // Temporarily disabled: return formService.deleteForm(formId);
      console.warn("Simulating form deletion - using mock data");
      return Promise.resolve();
    },
    onSuccess: (_, formId) => {
      // Remove form from cache and invalidate forms list
      queryClient.removeQueries({ queryKey: ["form", formId] });
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });
};
