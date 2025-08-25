import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, BarChart3, Settings } from "lucide-react";

interface FormCardProps {
  form: {
    id: string;
    name: string;
    status: "active" | "draft" | "paused";
    submissions: number;
    lastSubmission: string;
    conversionRate: number;
  };
  onViewAnalytics?: (formId: string) => void;
  onEditForm?: (formId: string) => void;
}

interface ConnectedFormsTabProps {
  forms: FormCardProps["form"][];
  onConnectForm?: () => void;
  onViewAnalytics?: (formId: string) => void;
  onEditForm?: (formId: string) => void;
}

const getStatusColor = (
  status: string
): "default" | "secondary" | "outline" => {
  switch (status) {
    case "active":
      return "default";
    case "draft":
      return "secondary";
    case "paused":
      return "outline";
    default:
      return "secondary";
  }
};

function FormCard({ form, onViewAnalytics, onEditForm }: FormCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{form.name}</CardTitle>
          <Badge variant={getStatusColor(form.status)}>{form.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Submissions</p>
            <p className="font-semibold">{form.submissions}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Conversion</p>
            <p className="font-semibold">{form.conversionRate}%</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Last submission</p>
          <p className="font-medium">{form.lastSubmission}</p>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onViewAnalytics?.(form.id)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEditForm?.(form.id)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ onConnectForm }: { onConnectForm?: () => void }) {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <div className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50 flex items-center justify-center bg-muted rounded-full">
          <Plus className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No forms connected</h3>
        <p className="text-muted-foreground mb-4">
          Connect forms to this workspace to start automating
        </p>
        <Button onClick={onConnectForm}>
          <Plus className="h-4 w-4 mr-2" />
          Connect Your First Form
        </Button>
      </CardContent>
    </Card>
  );
}

export function ConnectedFormsTab({
  forms,
  onConnectForm,
  onViewAnalytics,
  onEditForm,
}: ConnectedFormsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredForms = forms.filter((form) =>
    form.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasFilteredResults = filteredForms.length > 0;
  const hasSearchQuery = searchQuery.length > 0;

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onConnectForm}>
          <Plus className="h-4 w-4 mr-2" />
          Connect Form
        </Button>
      </div>

      {/* Forms Grid */}
      {hasFilteredResults ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredForms.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              onViewAnalytics={onViewAnalytics}
              onEditForm={onEditForm}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50 flex items-center justify-center bg-muted rounded-full">
              {hasSearchQuery ? (
                <Search className="h-8 w-8" />
              ) : (
                <Plus className="h-8 w-8" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {hasSearchQuery ? "No forms found" : "No forms connected"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {hasSearchQuery
                ? "Try adjusting your search criteria"
                : "Connect forms to this workspace to start automating"}
            </p>
            <Button onClick={onConnectForm}>
              <Plus className="h-4 w-4 mr-2" />
              {hasSearchQuery ? "Clear Search" : "Connect Your First Form"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
