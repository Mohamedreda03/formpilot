"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaces, useCreateWorkspace } from "@/hooks/use-workspaces";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function WorkspaceSelectPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { data: workspaces, isLoading, error } = useWorkspaces();
  const createWorkspaceMutation = useCreateWorkspace();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  // Check authentication first
  useEffect(() => {
    if (!loading && !user) {
      // User not authenticated, redirect to home
      router.replace("/");
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && !isLoading && workspaces && workspaces.length > 0) {
      // Find the default workspace or use the first one
      const defaultWorkspace =
        workspaces.find((ws) => ws.isDefault) || workspaces[0];

      // Redirect to the selected workspace
      router.replace(`/workspace/${defaultWorkspace.$id}`);
    }
  }, [workspaces, isLoading, router, user, loading]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, this will redirect in useEffect
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;

    try {
      const newWorkspace = await createWorkspaceMutation.mutateAsync({
        name: newWorkspaceName.trim(),
        description: `Workspace for ${newWorkspaceName.trim()}`,
        isDefault: workspaces?.length === 0, // Make first workspace default
      });

      toast.success("Workspace created successfully!");
      setNewWorkspaceName("");
      setIsCreateDialogOpen(false);

      // Navigate to the new workspace
      router.push(`/workspace/${newWorkspace.$id}`);
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast.error("Failed to create workspace");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your workspaces...</p>
        </div>
      </div>
    );
  }

  if (error || !workspaces || workspaces.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center max-w-md">
          <div className="text-2xl font-semibold">Welcome to FormPilot!</div>
          <p className="text-muted-foreground">
            You don't have any workspaces yet. Create your first workspace to
            get started with building forms.
          </p>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workspace</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="workspace-name"
                    className="text-sm font-medium"
                  >
                    Workspace Name
                  </label>
                  <Input
                    id="workspace-name"
                    placeholder="My Awesome Workspace"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCreateWorkspace();
                      }
                    }}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateWorkspace}
                    disabled={
                      !newWorkspaceName.trim() ||
                      createWorkspaceMutation.isPending
                    }
                  >
                    {createWorkspaceMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Create Workspace"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <button
            onClick={() => router.push("/")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // This should not show as we redirect immediately
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">
          Redirecting to your workspace...
        </p>
      </div>
    </div>
  );
}
