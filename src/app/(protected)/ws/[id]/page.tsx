"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TeamManagement from "@/components/team/TeamManagement";
import {
  Grid3X3,
  List,
  Edit2,
  Check,
  X,
  Clock,
  ArrowUpDown,
  Loader2,
  AlertTriangle,
  Plus,
  SortDesc,
  Type,
} from "lucide-react";
import { toast } from "sonner";
import { useForms } from "@/hooks/use-forms";
import { useWorkspace, useUpdateWorkspace } from "@/hooks/use-workspaces";
import CreateFormButton from "@/components/CreateFormButton";
import { Separator } from "@/components/ui/separator";
import WorkspaceLoadingState from "../components/workspace-loading";
import WorkspaceErrorState from "../components/workspace-error";
import FormsList from "../components/forms-list";
import PartialWorkspaceLoading from "../components/partial-workspace-loading";

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;

  const [mounted, setMounted] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [sortBy, setSortBy] = useState("created_date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Debug log for sortBy changes
  useEffect(() => {
    console.log("sortBy changed to:", sortBy);
  }, [sortBy]);

  const {
    data: workspace,
    isLoading: workspaceLoading,
    error: workspaceError,
    refetch: refetchWorkspace,
  } = useWorkspace(workspaceId);

  const {
    data: forms = [],
    isLoading: formsLoading,
    error: formsError,
    refetch: refetchForms,
    isFetching: isFormsFetching,
  } = useForms(workspaceId, sortBy);

  const updateWorkspaceMutation = useUpdateWorkspace();

  // Track sorting state for better UX - more precise detection
  const isSorting = isFormsFetching && !formsLoading && forms.length > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (workspace) {
      setWorkspaceName(workspace.name);
      setEditName(workspace.name);
    }
  }, [workspace]);

  // Add window focus listener to refresh data when returning from form creation
  useEffect(() => {
    const handleFocus = () => {
      if (workspaceId && !formsLoading) {
        refetchForms();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [workspaceId, formsLoading, refetchForms]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (workspaceLoading) {
    return (
      <PartialWorkspaceLoading viewMode={viewMode} setViewMode={setViewMode} />
    );
  }

  if (workspaceError) {
    return (
      <WorkspaceErrorState
        error={workspaceError.message || "Failed to load workspace"}
        onRetry={refetchWorkspace}
      />
    );
  }

  if (!workspace) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Workspace not found</h2>
        <p className="text-muted-foreground mb-6">
          The workspace you're looking for doesn't exist or you don't have
          access to it.
        </p>
        <Button onClick={() => router.push("/ws")}>
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Back to Workspaces
        </Button>
      </div>
    );
  }

  const handleSaveWorkspaceName = async () => {
    if (!editName.trim() || editName === workspaceName) {
      setIsEditingName(false);
      return;
    }

    try {
      await updateWorkspaceMutation.mutateAsync({
        workspaceId,
        data: { name: editName.trim() },
      });
      setWorkspaceName(editName.trim());
      setIsEditingName(false);
      toast.success("Workspace name updated successfully!");
    } catch (error) {
      console.error("Error updating workspace name:", error);
      toast.error("Failed to update workspace name");
      setEditName(workspaceName);
    }
  };

  const handleCancelEditName = () => {
    setEditName(workspaceName);
    setIsEditingName(false);
  };

  const handleEditForm = (formId: string) => {
    router.push(`/form/${formId}`);
  };

  const handleViewForm = (formId: string) => {
    router.push(`/form/${formId}/view`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-2xl font-bold border-0 px-0 focus-visible:ring-0"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveWorkspaceName();
                  if (e.key === "Escape") handleCancelEditName();
                }}
                autoFocus
              />
              <Button size="sm" onClick={handleSaveWorkspaceName}>
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEditName}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{workspaceName}</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingName(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          <p className="text-muted-foreground">
            Manage your forms and data in this workspace
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TeamManagement
            workspaceId={workspaceId}
            workspaceName={workspaceName}
          />

          <CreateFormButton
            workspaceId={workspaceId}
            workspaceName={workspaceName}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Form
          </CreateFormButton>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Forms</h2>
            <Badge variant="outline">
              {forms.length} {forms.length === 1 ? "form" : "forms"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={sortBy}
              onValueChange={(newValue) => {
                console.log("Select onValueChange:", newValue);
                setSortBy(newValue);
              }}
            >
              <SelectTrigger className="w-48 h-10 border-2">
                <div className="flex items-center gap-2">
                  {isSorting && <Loader2 className="h-3 w-3 animate-spin" />}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_date">
                  <div className="flex items-center gap-2">
                    <SortDesc className="h-4 w-4" />
                    Newest first
                  </div>
                </SelectItem>
                <SelectItem value="modified_date">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recently updated
                  </div>
                </SelectItem>
                <SelectItem value="alphabetical">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Alphabetical
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-10 w-10 p-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-10 w-10 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {formsError ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load forms: {formsError.message}
              <Button
                variant="link"
                size="sm"
                onClick={() => refetchForms()}
                className="ml-2"
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <FormsList
            forms={forms}
            viewMode={viewMode}
            onEditForm={handleEditForm}
            onViewForm={handleViewForm}
            workspaceId={workspaceId}
            workspaceName={workspaceName}
            isLoading={formsLoading}
            isSorting={isSorting}
          />
        )}
      </div>
    </div>
  );
}
