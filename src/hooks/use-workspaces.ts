"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workspaceService, type Workspace } from "@/lib/appwrite-services";
import { mockWorkspaces } from "@/lib/mock-data";

export const useWorkspaces = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      try {
        // Temporarily disabled: return await workspaceService.getWorkspaces();
        // Using mock data until ownerId attribute is added to Appwrite
        console.warn(
          "Using mock data - ownerId attribute not configured in Appwrite"
        );
        return mockWorkspaces;
      } catch (error: any) {
        console.warn("Using mock data due to Appwrite error:", error.message);
        return mockWorkspaces;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes instead of 5
    refetchOnWindowFocus: false, // Prevent excessive refetching
    refetchOnMount: false, // Only refetch when data is stale
    retry: 1, // Reduce retry attempts
  });
};

export const useWorkspace = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      try {
        // Temporarily disabled: return await workspaceService.getWorkspace(workspaceId);
        // Using mock data until attributes are configured in Appwrite
        console.warn("Using mock data - attributes not configured in Appwrite");
        const mockWorkspace = mockWorkspaces.find(
          (ws) => ws.$id === workspaceId
        );
        if (!mockWorkspace) {
          throw new Error("Workspace not found");
        }
        return mockWorkspace;
      } catch (error: any) {
        console.warn("Using mock data due to Appwrite error:", error.message);
        const mockWorkspace = mockWorkspaces.find(
          (ws) => ws.$id === workspaceId
        );
        if (!mockWorkspace) {
          throw new Error("Workspace not found");
        }
        return mockWorkspace;
      }
    },
    enabled: !!workspaceId,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      isDefault?: boolean;
    }) => {
      try {
        // Temporarily disabled: return await workspaceService.createWorkspace(data);
        // Simulate creating workspace with mock data
        console.warn("Simulating workspace creation - using mock data");
        const newWorkspace = {
          $id: `mock-workspace-${Date.now()}`,
          name: data.name,
          description: data.description || "",
          status: "active" as const,
          isDefault: data.isDefault || false,
          ownerId: "mock-user",
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString(),
        };
        return newWorkspace;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch workspaces
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      data,
    }: {
      workspaceId: string;
      data: Partial<Omit<Workspace, "$id" | "$createdAt" | "$updatedAt">>;
    }) => workspaceService.updateWorkspace(workspaceId, data),
    onSuccess: (updatedWorkspace) => {
      // Update the specific workspace in cache
      queryClient.setQueryData(
        ["workspace", updatedWorkspace.$id],
        updatedWorkspace
      );
      // Invalidate workspaces list to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: string) =>
      workspaceService.deleteWorkspace(workspaceId),
    onSuccess: () => {
      // Invalidate workspaces to refetch the list
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });
};
