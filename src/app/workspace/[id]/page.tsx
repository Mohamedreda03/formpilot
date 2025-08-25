"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { WorkspaceStats } from "@/components/workspace/WorkspaceStats";
import { WorkspaceTabs } from "@/components/workspace/WorkspaceTabs";
import { useWorkspace, useUpdateWorkspace } from "@/hooks/use-workspaces";
import { useForms } from "@/hooks/use-forms";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Folders,
  Grid3X3,
  List,
  Edit2,
  Check,
  X,
  Calendar,
  Clock,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

function WorkspacePageHeader({
  workspaceName,
  onNameChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: {
  workspaceName: string;
  onNameChange: (name: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(workspaceName);

  useEffect(() => {
    setEditName(workspaceName);
  }, [workspaceName]);

  const handleSaveName = () => {
    if (editName.trim() && editName !== workspaceName) {
      onNameChange(editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(workspaceName);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div className="flex items-center justify-between p-6 border-b bg-background">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Folders className="h-6 w-6 text-primary" />
        </div>
        <div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyPress}
                className="text-2xl font-bold h-auto py-1 px-2 border-primary"
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleSaveName}
                disabled={!editName.trim()}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{workspaceName}</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="opacity-60 hover:opacity-100"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          <p className="text-muted-foreground">
            Manage your forms and submissions
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_date">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Created Date
                </div>
              </SelectItem>
              <SelectItem value="modified_date">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Modified Date
                </div>
              </SelectItem>
              <SelectItem value="alphabetical">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Alphabetical
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className="h-8 w-8 p-0"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function WorkspaceLoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="p-6">
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

function WorkspaceErrorState({ error }: { error: string }) {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <div className="h-16 w-16 mx-auto mb-4 text-red-500/50 flex items-center justify-center bg-red-50 rounded-full">
          <Folders className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-red-600">
          Error Loading Workspace
        </h3>
        <p className="text-muted-foreground">{error}</p>
      </CardContent>
    </Card>
  );
}

function WorkspaceNotFound() {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <div className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50 flex items-center justify-center bg-muted/50 rounded-full">
          <Folders className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Workspace Not Found</h3>
        <p className="text-muted-foreground">
          The workspace you're looking for doesn't exist or you don't have
          access to it.
        </p>
      </CardContent>
    </Card>
  );
}

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const { user, loading } = useAuth();

  // Check authentication first
  useEffect(() => {
    if (!loading && !user) {
      // User not authenticated, redirect to home
      router.replace("/");
      return;
    }
  }, [user, loading, router]);

  // Local state for page header
  const [workspaceName, setWorkspaceName] = useState("Loading...");
  const [sortBy, setSortBy] = useState("created_date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // React Query hooks - only run if user is authenticated
  const {
    data: workspace,
    isLoading: workspaceLoading,
    error: workspaceError,
  } = useWorkspace(workspaceId);
  const { data: forms = [], isLoading: formsLoading } = useForms(workspaceId);
  const updateWorkspaceMutation = useUpdateWorkspace();

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

  // Update workspace name when data loads
  useEffect(() => {
    if (workspace) {
      setWorkspaceName(workspace.name);
    }
  }, [workspace]);

  // Handler to save workspace name to database
  const handleWorkspaceNameChange = async (newName: string) => {
    try {
      await updateWorkspaceMutation.mutateAsync({
        workspaceId: workspaceId,
        data: { name: newName },
      });
      setWorkspaceName(newName);
      toast.success("Workspace name updated successfully!");
    } catch (error: any) {
      console.error("Error updating workspace name:", error);
      toast.error("Failed to update workspace name");
      // Revert the name on error
      if (workspace) {
        setWorkspaceName(workspace.name);
      }
    }
  };

  // Event Handlers
  const handleStatusChange = (status: "active" | "paused") => {
    // TODO: Implement status update
    console.log("Update workspace status:", status);
  };

  const handleEditWorkspace = () => {
    console.log("Edit workspace:", workspace?.$id);
    // Navigate to edit page or open modal
  };

  const handleDeleteWorkspace = () => {
    console.log("Delete workspace:", workspace?.$id);
    // Show confirmation dialog
  };

  const handleConnectForm = () => {
    console.log("Connect form to workspace:", workspace?.$id);
    // Open form selection modal
  };

  const handleViewAnalytics = (formId: string) => {
    console.log("View analytics for form:", formId);
    // Navigate to analytics page
  };

  const handleEditForm = (formId: string) => {
    console.log("Edit form:", formId);
    // Navigate to form editor
  };

  const handleAddAction = () => {
    console.log("Add action to workspace:", workspace?.$id);
    // Open action configuration modal
  };

  const handleConfigureAction = (index: number) => {
    console.log("Configure action:", index);
    // Open action configuration modal
  };

  const handleDeleteAction = (index: number) => {
    console.log("Delete action:", index);
  };

  const handleViewAllLogs = () => {
    console.log("View all logs for workspace:", workspace?.$id);
    // Navigate to logs page
  };

  const handleViewRunDetails = (runId: string) => {
    console.log("View run details:", runId);
    // Navigate to run details page
  };

  // Loading State
  if (workspaceLoading || formsLoading) {
    return <WorkspaceLoadingState />;
  }

  // Error State
  if (workspaceError) {
    return (
      <WorkspaceErrorState
        error={workspaceError.message || "An error occurred"}
      />
    );
  }

  // Not Found State
  if (!workspace) {
    return <WorkspaceNotFound />;
  }

  // Prepare stats for component (mock data for now)
  const stats = {
    totalRuns: 0,
    successRate: 0,
    avgRunTime: "0s",
    connectedForms: forms.length,
  };

  // Mock workspace data for components that expect old format
  const mockWorkspaceData = {
    id: workspace.$id || "",
    name: workspace.name,
    description: workspace.description || "",
    status: workspace.status,
    created: workspace.$createdAt || "",
    lastRun: "Never",
    forms: forms.map((form) => ({
      id: form.$id || "",
      name: form.name,
      status:
        form.status === "active" ? ("active" as const) : ("draft" as const),
      submissions: form.submissions || 0,
      lastSubmission: form.$updatedAt || "",
      conversionRate: 0,
    })),
    actions: [],
    recentRuns: [],
  };

  return (
    <div className="space-y-6">
      {/* Page Header with editable name and controls */}
      <WorkspacePageHeader
        workspaceName={workspaceName}
        onNameChange={handleWorkspaceNameChange}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <WorkspaceHeader
        workspace={mockWorkspaceData}
        onStatusChange={handleStatusChange}
        onEdit={handleEditWorkspace}
        onDelete={handleDeleteWorkspace}
      />

      <WorkspaceStats stats={stats} />

      <WorkspaceTabs
        workspace={mockWorkspaceData}
        onConnectForm={handleConnectForm}
        onViewAnalytics={handleViewAnalytics}
        onEditForm={handleEditForm}
        onAddAction={handleAddAction}
        onConfigureAction={handleConfigureAction}
        onDeleteAction={handleDeleteAction}
        onViewAllLogs={handleViewAllLogs}
        onViewRunDetails={handleViewRunDetails}
      />
    </div>
  );
}
