import React from "react";
import GridView from "./grid-view";
import LinearView from "./linear-view";
import EmptyFormsState from "./empty-forms";
import FormsSkeleton from "./forms-skeleton";

interface FormsListProps {
  forms: any[];
  viewMode: "grid" | "list";
  onEditForm: (formId: string) => void;
  onViewForm: (formId: string) => void;
  workspaceId: string;
  workspaceName: string;
  isLoading?: boolean;
  isSorting?: boolean;
}

export default function FormsList({
  forms,
  viewMode,
  onEditForm,
  onViewForm,
  workspaceId,
  workspaceName,
  isLoading = false,
  isSorting = false,
}: FormsListProps) {
  // Show skeleton if loading initially
  if (isLoading) {
    return <FormsSkeleton viewMode={viewMode} count={8} />;
  }

  // Show subtle loading during sorting without blocking content
  if (isSorting && forms && forms.length > 0) {
    return (
      <div className="relative">
        {/* Show existing content with slight opacity */}
        <div className="opacity-75 pointer-events-none">
          {viewMode === "grid" ? (
            <GridView
              forms={forms}
              onViewForm={onViewForm}
              onEditForm={onEditForm}
            />
          ) : (
            <LinearView
              forms={forms}
              onViewForm={onViewForm}
              onEditForm={onEditForm}
            />
          )}
        </div>
        {/* Overlay with sorting indicator */}
        <div className="absolute top-4 right-4 bg-background/90 border rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Sorting...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show skeleton during sorting if no existing forms
  if (isSorting) {
    return <FormsSkeleton viewMode={viewMode} count={6} />;
  }

  if (!forms || forms.length === 0) {
    return (
      <EmptyFormsState
        workspaceId={workspaceId}
        workspaceName={workspaceName}
      />
    );
  }

  // Fixed: Corrected the view mode logic
  if (viewMode === "grid") {
    return (
      <GridView forms={forms} onViewForm={onViewForm} onEditForm={onEditForm} />
    );
  } else {
    return (
      <LinearView
        forms={forms}
        onViewForm={onViewForm}
        onEditForm={onEditForm}
      />
    );
  }
}
