import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Activity } from "lucide-react";

interface WorkspaceRun {
  id: string;
  status: "success" | "failed" | "running";
  timestamp: string;
  duration: string;
  trigger: string;
}

interface RecentRunsTabProps {
  runs: WorkspaceRun[];
  onViewAllLogs?: () => void;
  onViewRunDetails?: (runId: string) => void;
}

const getRunStatusIcon = (status: string) => {
  switch (status) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "running":
      return <Clock className="h-4 w-4 text-blue-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

const getRunStatusColor = (
  status: string
): "default" | "destructive" | "secondary" => {
  switch (status) {
    case "success":
      return "default";
    case "failed":
      return "destructive";
    case "running":
      return "secondary";
    default:
      return "secondary";
  }
};

function RunCard({
  run,
  onViewDetails,
}: {
  run: WorkspaceRun;
  onViewDetails?: (runId: string) => void;
}) {
  return (
    <Card
      className="hover:shadow-sm transition-shadow cursor-pointer"
      onClick={() => onViewDetails?.(run.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {getRunStatusIcon(run.status)}
            <div className="flex-1">
              <p className="font-medium">{run.trigger}</p>
              <p className="text-sm text-muted-foreground">
                {run.timestamp} • Duration: {run.duration}
              </p>
            </div>
          </div>
          <Badge variant={getRunStatusColor(run.status)}>{run.status}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyRunsState() {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <div className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50 flex items-center justify-center bg-muted rounded-full">
          <Activity className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No workspace runs yet</h3>
        <p className="text-muted-foreground">
          Workspace runs will appear here once your workspace starts processing
          forms
        </p>
      </CardContent>
    </Card>
  );
}

export function RecentRunsTab({
  runs,
  onViewAllLogs,
  onViewRunDetails,
}: RecentRunsTabProps) {
  const hasRuns = runs.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Workspace Runs</h3>
        {hasRuns && (
          <Button variant="outline" size="sm" onClick={onViewAllLogs}>
            <Activity className="h-4 w-4 mr-2" />
            View All Logs
          </Button>
        )}
      </div>

      {hasRuns ? (
        <div className="space-y-3">
          {runs.map((run) => (
            <RunCard key={run.id} run={run} onViewDetails={onViewRunDetails} />
          ))}
        </div>
      ) : (
        <EmptyRunsState />
      )}
    </div>
  );
}
