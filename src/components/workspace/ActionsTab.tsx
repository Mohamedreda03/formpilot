import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Mail,
  Slack,
  Webhook,
  Database,
  Plus,
  Settings,
  MoreVertical,
} from "lucide-react";

interface ActionConfig {
  to?: string;
  template?: string;
  channel?: string;
  message?: string;
  url?: string;
  method?: string;
  table?: string;
  action?: string;
}

interface WorkspaceAction {
  type: "email" | "slack" | "webhook" | "database";
  config: ActionConfig;
}

interface ActionsTabProps {
  actions: WorkspaceAction[];
  onAddAction?: () => void;
  onConfigureAction?: (index: number) => void;
  onDeleteAction?: (index: number) => void;
}

const actionIcons = {
  email: Mail,
  slack: Slack,
  webhook: Webhook,
  database: Database,
};

const getActionDescription = (action: WorkspaceAction): string => {
  switch (action.type) {
    case "email":
      return `Send to ${action.config.to || "recipients"}`;
    case "slack":
      return `Post to ${action.config.channel || "channel"}`;
    case "webhook":
      return `${action.config.method || "POST"} to ${
        action.config.url || "endpoint"
      }`;
    case "database":
      return `${action.config.action || "Insert"} to ${
        action.config.table || "table"
      }`;
    default:
      return "Unknown action";
  }
};

function ActionCard({
  action,
  index,
  onConfigure,
  onDelete,
}: {
  action: WorkspaceAction;
  index: number;
  onConfigure?: (index: number) => void;
  onDelete?: (index: number) => void;
}) {
  const Icon = actionIcons[action.type];
  const description = getActionDescription(action);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg capitalize">{action.type}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onConfigure?.(index)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete?.(index)}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyActionsState({ onAddAction }: { onAddAction?: () => void }) {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <div className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50 flex items-center justify-center bg-muted rounded-full">
          <Plus className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No actions configured</h3>
        <p className="text-muted-foreground mb-4">
          Add actions to define what happens when this workspace runs
        </p>
        <Button onClick={onAddAction}>
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Action
        </Button>
      </CardContent>
    </Card>
  );
}

export function ActionsTab({
  actions,
  onAddAction,
  onConfigureAction,
  onDeleteAction,
}: ActionsTabProps) {
  const hasActions = actions.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Workspace Actions</h3>
        <Button onClick={onAddAction}>
          <Plus className="h-4 w-4 mr-2" />
          Add Action
        </Button>
      </div>

      {hasActions ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <ActionCard
              key={index}
              action={action}
              index={index}
              onConfigure={onConfigureAction}
              onDelete={onDeleteAction}
            />
          ))}
        </div>
      ) : (
        <EmptyActionsState onAddAction={onAddAction} />
      )}
    </div>
  );
}
