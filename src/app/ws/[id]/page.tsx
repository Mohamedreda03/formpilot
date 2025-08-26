"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TeamManagement from "@/components/team/TeamManagement";
import {
  Grid3X3,
  List,
  Edit2,
  Check,
  X,
  Calendar,
  Clock,
  ArrowUpDown,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Plus,
  FileText,
  MousePointer,
  Eye,
  MoreHorizontal,
  Copy,
  Settings,
  Trash2,
  SortDesc,
  Type,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { useForms } from "@/hooks/use-forms";
import { useWorkspace, useUpdateWorkspace } from "@/hooks/use-workspaces";
import CreateFormButton from "@/components/CreateFormButton";
import { Separator } from "@/components/ui/separator";
import WorkspaceLoadingState from "../components/workspace-loading";
import WorkspaceErrorState from "../components/workspace-error";
import GridView from "../components/grid-view";
import LinearView from "../components/grid-view";

// Empty Forms State
function EmptyFormsState({
  workspaceId,
  workspaceName,
}: {
  workspaceId: string;
  workspaceName: string;
}) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No forms yet</h3>
      <p className="text-muted-foreground mb-6">
        Create your first form to start collecting submissions and data.
      </p>
      <CreateFormButton
        workspaceId={workspaceId}
        workspaceName={workspaceName}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Create First Form
      </CreateFormButton>
    </div>
  );
}

// Forms List Component
function FormsList({
  forms,
  viewMode,
  onEditForm,
  onViewForm,
  workspaceId,
  workspaceName,
}: {
  forms: any[];
  viewMode: "grid" | "list";
  onEditForm: (formId: string) => void;
  onViewForm: (formId: string) => void;
  workspaceId: string;
  workspaceName: string;
}) {
  if (forms.length === 0) {
    return (
      <EmptyFormsState
        workspaceId={workspaceId}
        workspaceName={workspaceName}
      />
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (viewMode === "grid") {
    return (
      <GridView forms={forms} onViewForm={onViewForm} onEditForm={onEditForm} />
    );
  }

  return (
    <LinearView forms={forms} onViewForm={onViewForm} onEditForm={onEditForm} />
  );
}

// Main Workspace Page Component
export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;

  // Local state
  const [mounted, setMounted] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [sortBy, setSortBy] = useState("created_date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // User role in workspace - في التطبيق الحقيقي سيأتي من API
  const [currentUserRole, setCurrentUserRole] = useState<
    "owner" | "admin" | "member" | "viewer"
  >("owner");

  // React Query hooks
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
  } = useForms(workspaceId);

  const updateWorkspaceMutation = useUpdateWorkspace();

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update workspace name when data loads
  useEffect(() => {
    if (workspace) {
      setWorkspaceName(workspace.name);
      setEditName(workspace.name);
    }
  }, [workspace]);

  // Show loading during hydration
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

  // Loading state
  if (workspaceLoading || formsLoading) {
    return <WorkspaceLoadingState />;
  }

  // Error state
  if (workspaceError) {
    return (
      <WorkspaceErrorState
        error={workspaceError.message || "Failed to load workspace"}
        onRetry={refetchWorkspace}
      />
    );
  }

  // Workspace not found
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
    router.push(`/ws/${workspaceId}/form/${formId}/edit`);
  };

  const handleViewForm = (formId: string) => {
    router.push(`/ws/${workspaceId}/form/${formId}`);
  };

  // Sort forms
  const sortedForms = [...forms].sort((a, b) => {
    switch (sortBy) {
      case "created_date":
        return (
          new Date(b.$createdAt || "").getTime() -
          new Date(a.$createdAt || "").getTime()
        );
      case "modified_date":
        return (
          new Date(b.$updatedAt || "").getTime() -
          new Date(a.$updatedAt || "").getTime()
        );
      case "alphabetical":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // Calculate stats
  const totalSubmissions = forms.reduce(
    (total: number, form: any) => total + (form.submissionCount || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
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
          {/* Team Management */}
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

      {/* Forms Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Forms</h2>
            <Badge variant="outline">
              {forms.length} {forms.length === 1 ? "form" : "forms"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
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
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
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
            forms={sortedForms}
            viewMode={viewMode}
            onEditForm={handleEditForm}
            onViewForm={handleViewForm}
            workspaceId={workspaceId}
            workspaceName={workspaceName}
          />
        )}
      </div>
    </div>
  );
}
