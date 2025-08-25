"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Folders, Building } from "lucide-react";
import { useWorkspaces, useCreateWorkspace } from "@/hooks/use-workspaces";
import { useForms } from "@/hooks/use-forms";
import { toast } from "sonner";

interface AppSidebarProps {
  onWorkspaceSelect?: (workspaceId: string) => void;
  selectedWorkspaceId?: string;
  currentWorkspaceName?: string;
}

export function AppSidebar({
  onWorkspaceSelect,
  selectedWorkspaceId = "private",
  currentWorkspaceName = "Private",
}: AppSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateFormDialogOpen, setIsCreateFormDialogOpen] = useState(false);
  const [isCreateWorkspaceDialogOpen, setIsCreateWorkspaceDialogOpen] =
    useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [newFormDescription, setNewFormDescription] = useState("");
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const router = useRouter();

  // React Query hooks
  const {
    data: workspaces = [],
    isLoading: workspacesLoading,
    error: workspacesError,
  } = useWorkspaces();
  const createWorkspaceMutation = useCreateWorkspace();

  // Fallback data if there's an error
  const fallbackWorkspaces = [
    {
      $id: "fallback-1",
      name: "Default Workspace",
      description: "Your default workspace",
      ownerId: "",
      status: "active" as const,
    },
  ];

  const displayWorkspaces = workspacesError ? fallbackWorkspaces : workspaces;

  const handleWorkspaceSelect = (workspaceId: string) => {
    if (onWorkspaceSelect) {
      onWorkspaceSelect(workspaceId);
    } else {
      // Navigate to workspace page with dynamic route using router
      router.push(`/workspace/${workspaceId}`);
    }
  };

  const handleCreateForm = () => {
    console.log("Create new form:", {
      name: newFormName,
      description: newFormDescription,
    });
    setNewFormName("");
    setNewFormDescription("");
    setIsCreateFormDialogOpen(false);
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;

    try {
      await createWorkspaceMutation.mutateAsync({
        name: newWorkspaceName.trim(),
        description: `Workspace for ${newWorkspaceName.trim()}`,
      });

      toast.success("Workspace created successfully!");
      setNewWorkspaceName("");
      setIsCreateWorkspaceDialogOpen(false);
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast.error("Failed to create workspace");
    }
  };

  const filteredWorkspaces = displayWorkspaces.filter((workspace) =>
    workspace.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        {/* Create Form Button */}
        <Dialog
          open={isCreateFormDialogOpen}
          onOpenChange={setIsCreateFormDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="w-full flex items-center justify-center">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Form
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Form</DialogTitle>
              <DialogDescription>
                Create a new form in {currentWorkspaceName} workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="form-name" className="text-sm font-medium">
                  Form Name
                </label>
                <Input
                  id="form-name"
                  placeholder="Enter form name..."
                  value={newFormName}
                  onChange={(e) => setNewFormName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="form-description"
                  className="text-sm font-medium"
                >
                  Description
                </label>
                <Input
                  id="form-description"
                  placeholder="Enter form description..."
                  value={newFormDescription}
                  onChange={(e) => setNewFormDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateFormDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateForm} disabled={!newFormName.trim()}>
                Create Form
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarHeader>

      <SidebarContent className="px-4">
        {/* Workspaces Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 justify-between">
                <Folders className="h-4 w-4" />
                <span className="font-medium">Workspaces</span>
              </div>
              <Dialog
                open={isCreateWorkspaceDialogOpen}
                onOpenChange={setIsCreateWorkspaceDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm" className="h-6 w-6">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Workspace</DialogTitle>
                    <DialogDescription>
                      Create a new workspace to organize your forms.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label
                        htmlFor="workspace-name"
                        className="text-sm font-medium"
                      >
                        Workspace Name
                      </label>
                      <Input
                        id="workspace-name"
                        placeholder="Enter workspace name..."
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateWorkspaceDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateWorkspace}
                      disabled={!newWorkspaceName.trim()}
                    >
                      Create Workspace
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </SidebarGroupLabel>

          {/* Search for Workspaces */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workspaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filteredWorkspaces.map((workspace) => (
                <SidebarMenuItem key={workspace.$id}>
                  <SidebarMenuButton
                    isActive={selectedWorkspaceId === workspace.$id}
                    onClick={() => handleWorkspaceSelect(workspace.$id || "")}
                    className="w-full justify-between py-2"
                  >
                    <div className="flex items-center gap-3">
                      <Building className="h-4 w-4" />
                      <span className="font-medium">{workspace.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      0
                    </Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            {filteredWorkspaces.length === 0 && searchQuery && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No workspaces found matching "{searchQuery}"
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
