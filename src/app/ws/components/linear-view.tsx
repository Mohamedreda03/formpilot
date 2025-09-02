import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { formatDate } from "date-fns";

import {
  Calendar,
  Copy,
  Edit2,
  Eye,
  FileText,
  MoreHorizontal,
  MousePointer,
  Settings,
  Trash2,
} from "lucide-react";
import React from "react";

interface LinearViewProps {
  forms: any[];
  onViewForm: (formId: string) => void;
  onEditForm: (formId: string) => void;
}

export default function LinearView({
  forms,
  onViewForm,
  onEditForm,
}: LinearViewProps) {
  const handleRowClick = (formId: string, event: React.MouseEvent) => {
    // Prevent row click when clicking on buttons or dropdown
    if (
      (event.target as HTMLElement).closest("button") ||
      (event.target as HTMLElement).closest('[role="button"]')
    ) {
      return;
    }
    onEditForm(formId); // Navigate to form creation/edit page
  };

  return (
    <div className="space-y-3">
      {forms.map((form) => (
        <div
          key={form.$id}
          className="group flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 hover:border-primary/20 transition-all duration-200 cursor-pointer"
          onClick={(e) => handleRowClick(form.$id, e)}
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
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MousePointer className="h-3 w-3" />
                  <span>{form.submissionCount || 0} submissions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDate(
                      form.$updatedAt || form.$createdAt,
                      "MMM dd, yyyy"
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewForm(form.$id);
              }}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEditForm(form.$id);
              }}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
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
