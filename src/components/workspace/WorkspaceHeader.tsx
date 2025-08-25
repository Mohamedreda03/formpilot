import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Play,
  Pause,
  Settings,
  MoreVertical,
  Activity,
  XCircle,
  CheckCircle,
  Clock,
  Calendar,
} from "lucide-react";

interface WorkspaceHeaderProps {
  workspace: {
    id: string;
    name: string;
    description: string;
    status: "active" | "paused" | "error";
    created: string;
    lastRun: string;
  };
  onStatusChange?: (status: "active" | "paused") => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "paused":
      return <Pause className="h-4 w-4 text-yellow-600" />;
    case "error":
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusColor = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "active":
      return "default";
    case "paused":
      return "secondary";
    case "error":
      return "destructive";
    default:
      return "outline";
  }
};

export function WorkspaceHeader({
  workspace,
  onStatusChange,
  onEdit,
  onDelete,
}: WorkspaceHeaderProps) {
  const handleStatusToggle = () => {
    const newStatus = workspace.status === "active" ? "paused" : "active";
    onStatusChange?.(newStatus);
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{workspace.name}</h1>
          {getStatusIcon(workspace.status)}
          <Badge variant={getStatusColor(workspace.status)}>
            {workspace.status}
          </Badge>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          {workspace.description}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Created {workspace.created}
          </div>
          <div className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            Last run {workspace.lastRun}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={workspace.status === "active" ? "outline" : "default"}
          size="sm"
          onClick={handleStatusToggle}
        >
          {workspace.status === "active" ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Resume
            </>
          )}
        </Button>

        <Button variant="outline" size="sm" onClick={onEdit}>
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Settings className="mr-2 h-4 w-4" />
              Edit Workspace
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Activity className="mr-2 h-4 w-4" />
              View Logs
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <XCircle className="mr-2 h-4 w-4" />
              Delete Workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
