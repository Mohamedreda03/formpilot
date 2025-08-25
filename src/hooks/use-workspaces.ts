"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workspaceService, type Workspace } from "@/lib/appwrite-services";

export const useWorkspaces = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      try {
        console.log("Fetching workspaces...");
        const workspaces = await workspaceService.getWorkspaces();
        console.log("Fetched workspaces:", workspaces);

        // If no workspaces exist, create a default one
        if (workspaces.length === 0) {
          console.log("No workspaces found, creating default workspace...");
          const defaultWorkspace = await workspaceService.createWorkspace({
            name: "My Workspace",
            description: "Your default workspace",
            color: "#3b82f6",
            icon: "folder",
          });
          console.log("Created default workspace:", defaultWorkspace);
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
        console.log("Fetching workspace:", workspaceId);
        const workspace = await workspaceService.getWorkspace(workspaceId);
        console.log("Fetched workspace:", workspace);
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
      color?: string;
      icon?: string;
    }) => {
      try {
        console.log("Creating workspace:", data);
        const workspace = await workspaceService.createWorkspace(data);
        console.log("Created workspace:", workspace);
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
