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
  CreateWorkspaceDialog,
  CreateFormDialog,
  CreateFormButton,
  CreateWorkspaceButton,
} from "@/components/ui/create-dialog";
import { Plus, Search, Folders, Building, Loader2 } from "lucide-react";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useWorkspaceFormsCount } from "@/hooks/use-forms";

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

  const router = useRouter();

  // React Query hooks
  const {
    data: workspaces = [],
    isLoading: workspacesLoading,
    error: workspacesError,
  } = useWorkspaces();

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
      router.push(`/ws/${workspaceId}`);
    }
  };

  const filteredWorkspaces = displayWorkspaces.filter((workspace) =>
    workspace.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        {/* Create Form Button */}
        <CreateFormButton
          workspaceId={selectedWorkspaceId}
          workspaceName={currentWorkspaceName}
          className="w-full"
        />
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
              <CreateWorkspaceButton
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <Plus className="h-3 w-3" />
              </CreateWorkspaceButton>
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
            {workspacesLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <SidebarMenu className="space-y-1">
                  {filteredWorkspaces.map((workspace) => (
                    <WorkspaceMenuItem
                      key={workspace.$id}
                      workspace={workspace}
                      isActive={selectedWorkspaceId === workspace.$id}
                      onSelect={() =>
                        handleWorkspaceSelect(workspace.$id || "")
                      }
                    />
                  ))}
                </SidebarMenu>

                {filteredWorkspaces.length === 0 && searchQuery && (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    No workspaces found matching "{searchQuery}"
                  </div>
                )}
              </>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

// Separate component to display a workspace item with its forms count
function WorkspaceMenuItem({
  workspace,
  isActive,
  onSelect,
}: {
  workspace: any;
  isActive: boolean;
  onSelect: () => void;
}) {
  const { data: formsCount = 0 } = useWorkspaceFormsCount(workspace.$id);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        onClick={onSelect}
        className="w-full justify-between py-2"
      >
        <div className="flex items-center gap-3">
          <Building className="h-4 w-4" />
          <span className="font-medium">{workspace.name}</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {formsCount}
        </Badge>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
