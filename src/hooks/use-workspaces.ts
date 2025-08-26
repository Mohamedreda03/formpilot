"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workspaceService, type Workspace } from "@/lib/appwrite-services";
import { useAuth } from "@/contexts/AuthContext";

export const useWorkspaces = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      try {
        const workspaces = await workspaceService.getWorkspaces();

        // If no workspaces exist, create a default one
        if (workspaces.length === 0) {
          const defaultWorkspace = await workspaceService.createWorkspace({
            name: "My Workspace",
            description: "Your default workspace",
            color: "#3b82f6",
            icon: "folder",
          });
          return [defaultWorkspace];
        }

        return workspaces;
      } catch (error: any) {
        console.error("Failed to fetch workspaces:", error);
        // Provide more detailed error information
        if (error.code) {
          throw new Error(`Appwrite Error ${error.code}: ${error.message}`);
        }
        throw new Error(
          `Failed to load workspaces: ${error.message || "Unknown error"}`
        );
      }
    },
    enabled: !!user,
    staleTime: 15 * 60 * 1000, // 15 minutes for workspaces (they don't change often)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2, // Slightly more retries for critical workspace data
  });
};

export const useWorkspace = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      try {
        const workspace = await workspaceService.getWorkspace(workspaceId);
        return workspace;
      } catch (error: any) {
        console.error("Failed to fetch workspace:", error);
        if (error.code) {
          throw new Error(`Appwrite Error ${error.code}: ${error.message}`);
        }
        throw new Error(
          `Failed to load workspace: ${error.message || "Unknown error"}`
        );
      }
    },
    enabled: !!workspaceId,
    staleTime: 15 * 60 * 1000, // 15 minutes for individual workspace data
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      color?: string;
      icon?: string;
    }) => {
      try {
        const workspace = await workspaceService.createWorkspace(data);
        return workspace;
      } catch (error: any) {
        console.error("Failed to create workspace:", error);
        if (error.code) {
          throw new Error(`Appwrite Error ${error.code}: ${error.message}`);
        }
        throw new Error(
          `Failed to create workspace: ${error.message || "Unknown error"}`
        );
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
