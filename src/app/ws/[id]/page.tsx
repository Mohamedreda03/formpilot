"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace, useUpdateWorkspace } from "@/hooks/use-workspaces";
import { useForms } from "@/hooks/use-forms";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateFormButton } from "@/components/ui/create-dialog";
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
  SortAsc,
  Type,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";

// Loading Component
function WorkspaceLoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-10" />
            <Skeleton className="h-9 w-10" />
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-2">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Error Component
function WorkspaceErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" onClick={onRetry} className="ml-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {forms.map((form) => (
          <Card
            key={form.$id}
            className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-base font-semibold line-clamp-1 mb-1">
                      {form.title}
                    </CardTitle>
                  </div>

                  {form.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {form.description}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewForm(form.$id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditForm(form.$id)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <span className="text-base">
                      {form.submissionCount || 0}
                    </span>
                    <span>
                      submission{(form.submissionCount || 0) !== 1 ? "s" : ""}
                    </span>
                  </Badge>
                  <Badge
                    variant={form.isActive ? "default" : "secondary"}
                    className="text-xs flex-shrink-0"
                  >
                    {form.isActive ? "Active" : "Draft"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(form.$updatedAt || form.$createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // List view - بدون Card wrapper
  return (
    <div className="space-y-3">
      {forms.map((form) => (
        <div
          key={form.$id}
          className="group flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 hover:border-primary/20 transition-all duration-200"
        >
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-semibold text-base truncate">
                  {form.title}
                </h4>
                <Badge
                  variant={form.isActive ? "default" : "secondary"}
                  className="text-xs flex-shrink-0"
                >
                  {form.isActive ? "Active" : "Draft"}
                </Badge>
              </div>
              {form.description && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                  {form.description}
                </p>
              )}
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MousePointer className="h-3 w-3" />
                  <span>{form.submissionCount || 0} submissions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Updated {formatDate(form.$updatedAt || form.$createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewForm(form.$id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditForm(form.$id)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}

// Main Workspace Page Component
export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const workspaceId = params.id as string;

  // Local state
  const [mounted, setMounted] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [sortBy, setSortBy] = useState("created_date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
    (total, form) => total + (form.submissionCount || 0),
    0
  );

  return (
    <ProtectedRoute>
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

          <CreateFormButton
            workspaceId={workspaceId}
            workspaceName={workspaceName}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Form
          </CreateFormButton>
        </div>

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
    </ProtectedRoute>
  );
}
