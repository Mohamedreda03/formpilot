"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaces, useCreateWorkspace } from "@/hooks/use-workspaces";

export function FirstTimeUserSetup() {
  const { user } = useAuth();
  const { data: workspaces = [], isLoading } = useWorkspaces();
  const createWorkspaceMutation = useCreateWorkspace();

  useEffect(() => {
    // If user exists, not loading, and no workspaces exist, create a default one
    if (user && !isLoading && workspaces.length === 0) {
      createWorkspaceMutation.mutate({
        name: "My First Workspace",
        description:
          "Welcome to your first workspace! Start creating amazing forms.",
        isDefault: true,
      });
    }
  }, [user, isLoading, workspaces.length, createWorkspaceMutation]);

  return null; // This component doesn't render anything
}
