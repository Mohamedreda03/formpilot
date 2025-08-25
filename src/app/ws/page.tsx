"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { Loader2 } from "lucide-react";

export default function WorkspaceIndexPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { data: workspaces, isLoading: workspacesLoading } = useWorkspaces();

  useEffect(() => {
    if (!loading && !workspacesLoading) {
      if (!user) {
        // User not authenticated, redirect to login
        router.replace("/");
        return;
      }

      // User is authenticated, redirect to latest workspace
      if (workspaces && workspaces.length > 0) {
        // Sort workspaces by creation date (newest first) and use the latest one
        const latestWorkspace = [...workspaces].sort(
          (a, b) =>
            new Date(b.$createdAt || "").getTime() -
            new Date(a.$createdAt || "").getTime()
        )[0];
        router.replace(`/ws/${latestWorkspace.$id}`);
      }
      // If no workspaces exist, FirstTimeUserSetup will create one
    }
  }, [user, loading, workspaces, workspacesLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">
          {loading || workspacesLoading
            ? "Loading workspace..."
            : "Redirecting..."}
        </p>
      </div>
    </div>
  );
}
