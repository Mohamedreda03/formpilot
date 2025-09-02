"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useCreateForm } from "@/hooks/use-forms";

interface CreateFormButtonProps {
  workspaceId: string;
  workspaceName: string;
  className?: string;
  children: React.ReactNode;
}

export default function CreateFormButton({
  workspaceId,
  workspaceName,
  className,
  children,
}: CreateFormButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const createFormMutation = useCreateForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a form title");
      return;
    }

    try {
      const newForm = await createFormMutation.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim(),
        workspaceId,
      });

      toast.success("Form created successfully!");
      setFormData({ title: "", description: "" });
      setOpen(false);

      // Redirect to form editor
      router.push(`/form/${newForm.$id}/create`);
    } catch (error) {
      console.error("Failed to create form:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create form"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className}>{children}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new form</DialogTitle>
          <DialogDescription>
            Create a new form in "{workspaceName}" workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Form title</Label>
            <Input
              id="title"
              placeholder="e.g. Customer Feedback Survey"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              autoFocus
              disabled={createFormMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of what this form is for..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              disabled={createFormMutation.isPending}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createFormMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createFormMutation.isPending}>
              {createFormMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Create Form
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
