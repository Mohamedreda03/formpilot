"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formService, type Form } from "@/lib/appwrite-services";
import { useAuth } from "@/contexts/AuthContext";

export const useForms = (workspaceId: string, sortBy?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["forms", workspaceId, sortBy || "created_date"],
    queryFn: async () => {
      try {
        console.log("Fetching forms with sortBy:", sortBy || "created_date"); // Debug log
        const forms = await formService.getForms(workspaceId, sortBy);
        console.log("Fetched forms:", forms.length); // Debug log
        return forms;
      } catch (error: any) {
        console.error("Failed to fetch forms:", error);
        if (error.code) {
          throw new Error(`Appwrite Error ${error.code}: ${error.message}`);
        }
        throw new Error(
          `Failed to load forms: ${error.message || "Unknown error"}`
        );
      }
    },
    enabled: !!workspaceId && !!user,
    staleTime: 1 * 60 * 1000, // 1 minute - balance between freshness and performance
    gcTime: 5 * 60 * 1000, // Keep in memory for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on mount
    retry: 2, // Retry failed requests twice
    refetchOnReconnect: true, // Refetch when connection is restored
  });
};

export const useCreateForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      workspaceId: string;
    }) => {
      try {
        const form = await formService.createForm(data);
        return form;
      } catch (error: any) {
        console.error("Failed to create form:", error);
        if (error.code) {
          throw new Error(`Appwrite Error ${error.code}: ${error.message}`);
        }
        throw new Error(
          `Failed to create form: ${error.message || "Unknown error"}`
        );
      }
    },
    onSuccess: (newForm) => {
      // Invalidate and refetch forms for the specific workspace
      queryClient.invalidateQueries({
        queryKey: ["forms", newForm.workspaceId],
      });

      // Also invalidate forms count
      queryClient.invalidateQueries({
        queryKey: ["forms-count", newForm.workspaceId],
      });

      // Optionally set the new form in cache for immediate access
      queryClient.setQueryData(["form", newForm.$id], newForm);
    },
    onError: (error) => {
      console.error("Create form mutation error:", error);
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

// Hook to fetch the number of forms for each workspace
export const useWorkspaceFormsCount = (workspaceId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["forms-count", workspaceId],
    queryFn: async () => {
      try {
        // Use a more efficient count query instead of fetching all forms
        const forms = await formService.getForms(workspaceId);
        return forms.length;
      } catch (error) {
        console.error("Failed to fetch forms count:", error);
        return 0;
      }
    },
    enabled: !!workspaceId && !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes for form counts
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });
};
