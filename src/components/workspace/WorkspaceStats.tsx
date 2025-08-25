import { Card, CardContent } from "@/components/ui/card";
import { Activity, TrendingUp, Clock, FileText } from "lucide-react";

interface WorkspaceStatsProps {
  stats: {
    totalRuns: number;
    successRate: number;
    avgRunTime: string;
    connectedForms: number;
  };
}

const statsConfig = [
  {
    key: "totalRuns",
    label: "Total Runs",
    icon: Activity,
    color: "text-blue-600",
  },
  {
    key: "successRate",
    label: "Success Rate",
    icon: TrendingUp,
    color: "text-green-600",
  },
  {
    key: "avgRunTime",
    label: "Avg. Runtime",
    icon: Clock,
    color: "text-purple-600",
  },
  {
    key: "connectedForms",
    label: "Connected Forms",
    icon: FileText,
    color: "text-orange-600",
  },
] as const;

export function WorkspaceStats({ stats }: WorkspaceStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statsConfig.map(({ key, label, icon: Icon, color }) => {
        let displayValue: string;

        switch (key) {
          case "totalRuns":
            displayValue = stats.totalRuns.toString();
            break;
          case "successRate":
            displayValue = `${stats.successRate}%`;
            break;
          case "avgRunTime":
            displayValue = stats.avgRunTime;
            break;
          case "connectedForms":
            displayValue = stats.connectedForms.toString();
            break;
          default:
            displayValue = "";
        }

        return (
          <Card key={key}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {label}
                  </p>
                  <p className="text-2xl font-bold">{displayValue}</p>
                </div>
                <Icon className={`h-8 w-8 ${color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
