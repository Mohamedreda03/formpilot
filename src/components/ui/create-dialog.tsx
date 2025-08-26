"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { useCreateWorkspace } from "@/hooks/use-workspaces";
import { useCreateForm } from "@/hooks/use-forms";
import { toast } from "sonner";

interface CreateDialogProps {
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  descriptionLabel?: string;
  descriptionPlaceholder?: string;
  createButtonText?: string;
  isLoading?: boolean;
  onSubmit: (data: {
    name: string;
    description?: string;
  }) => void | Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateDialog({
  trigger,
  title,
  description,
  nameLabel = "Name",
  namePlaceholder = "Enter name...",
  descriptionLabel = "Description",
  descriptionPlaceholder = "Enter description (optional)...",
  createButtonText = "Create",
  isLoading = false,
  onSubmit,
  open,
  onOpenChange,
}: CreateDialogProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;

    try {
      await onSubmit({
        name: name.trim(),
        description: desc.trim() || undefined,
      });
      setName("");
      setDesc("");
      setIsOpen(false);
    } catch (error) {
      console.error("Create dialog error:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{nameLabel}</Label>
            <Input
              id="name"
              placeholder={namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">{descriptionLabel}</Label>
            <Textarea
              id="description"
              placeholder={descriptionPlaceholder}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {createButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Component for creating a new workspace
export function CreateWorkspaceDialog({
  trigger,
  isLoading,
  onSubmit,
  open,
  onOpenChange,
}: {
  trigger?: React.ReactNode;
  isLoading?: boolean;
  onSubmit: (data: {
    name: string;
    description?: string;
  }) => void | Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <CreateDialog
      trigger={trigger}
      title="Create New Workspace"
      description="Create a new workspace to organize your forms and data."
      nameLabel="Workspace Name"
      namePlaceholder="Enter workspace name..."
      descriptionLabel="Description"
      descriptionPlaceholder="Describe your workspace (optional)..."
      createButtonText="Create Workspace"
      isLoading={isLoading}
      onSubmit={onSubmit}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}

// Component for creating a new form
export function CreateFormDialog({
  trigger,
  isLoading,
  onSubmit,
  open,
  onOpenChange,
}: {
  trigger?: React.ReactNode;
  isLoading?: boolean;
  onSubmit: (data: {
    name: string;
    description?: string;
  }) => void | Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <CreateDialog
      trigger={trigger}
      title="Create New Form"
      description="Create a new form to start collecting data."
      nameLabel="Form Name"
      namePlaceholder="Enter form name..."
      descriptionLabel="Description"
      descriptionPlaceholder="Describe your form (optional)..."
      createButtonText="Create Form"
      isLoading={isLoading}
      onSubmit={onSubmit}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}

// Reusable component: Create Form button that can be used anywhere
export function CreateFormButton({
  workspaceId,
  workspaceName,
  variant = "default",
  size = "default",
  className = "",
  children,
}: {
  workspaceId?: string;
  workspaceName?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const createFormMutation = useCreateForm();

  const handleCreateForm = async (data: {
    name: string;
    description?: string;
  }) => {
    if (!workspaceId || workspaceId === "private") {
      toast.error("Please select a workspace first");
      return;
    }

    try {
      await createFormMutation.mutateAsync({
        title: data.name,
        description: data.description,
        workspaceId: workspaceId,
      });

      toast.success("Form created successfully!");
      router.push(`/ws/${workspaceId}`);
    } catch (error) {
      console.error("Error creating form:", error);
      toast.error("Failed to create form");
    }
  };

  return (
    <CreateFormDialog
      trigger={
        <Button variant={variant} size={size} className={className}>
          {children || (
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Form
            </div>
          )}
        </Button>
      }
      isLoading={createFormMutation.isPending}
      onSubmit={handleCreateForm}
    />
  );
}

// Reusable component: Create Workspace button that can be used anywhere
export function CreateWorkspaceButton({
  variant = "default",
  size = "default",
  className = "",
  children,
}: {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}) {
  const createWorkspaceMutation = useCreateWorkspace();

  const handleCreateWorkspace = async (data: {
    name: string;
    description?: string;
  }) => {
    try {
      await createWorkspaceMutation.mutateAsync({
        name: data.name,
        description: data.description || `Workspace for ${data.name}`,
        color: "#3b82f6",
        icon: "folder",
      });

      toast.success("Workspace created successfully!");
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast.error("Failed to create workspace");
    }
  };

  return (
    <CreateWorkspaceDialog
      trigger={
        <Button variant={variant} size={size} className={className}>
          {children || (
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Workspace
            </div>
          )}
        </Button>
      }
      isLoading={createWorkspaceMutation.isPending}
      onSubmit={handleCreateWorkspace}
    />
  );
}
