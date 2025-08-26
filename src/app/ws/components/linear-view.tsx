import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  MoreVertical,
  Settings,
  Trash2,
} from "lucide-react";
import React from "react";

interface GridViewProps {
  forms: any[];
  onViewForm: (formId: string) => void;
  onEditForm: (formId: string) => void;
}

export default function GridView({
  forms,
  onViewForm,
  onEditForm,
}: GridViewProps) {
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
                  <span className="text-base">{form.submissionCount || 0}</span>
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
                <span>
                  {formatDate(
                    form.$updatedAt || form.$createdAt,
                    "MMM dd, yyyy"
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
