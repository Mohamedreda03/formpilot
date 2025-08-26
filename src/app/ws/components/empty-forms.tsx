import { FileText, Plus } from "lucide-react";
import CreateFormButton from "@/components/CreateFormButton";
import React from "react";

export default function EmptyFormsState({
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
