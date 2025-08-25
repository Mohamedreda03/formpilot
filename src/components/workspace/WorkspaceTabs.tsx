import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectedFormsTab } from "./ConnectedFormsTab";
import { ActionsTab } from "./ActionsTab";
import { RecentRunsTab } from "./RecentRunsTab";

interface WorkspaceTabsProps {
  workspace: {
    forms: Array<{
      id: string;
      name: string;
      status: "active" | "draft" | "paused";
      submissions: number;
      lastSubmission: string;
      conversionRate: number;
    }>;
    actions: Array<{
      type: "email" | "slack" | "webhook" | "database";
      config: any;
    }>;
    recentRuns: Array<{
      id: string;
      status: "success" | "failed" | "running";
      timestamp: string;
      duration: string;
      trigger: string;
    }>;
  };
  onConnectForm?: () => void;
  onViewAnalytics?: (formId: string) => void;
  onEditForm?: (formId: string) => void;
  onAddAction?: () => void;
  onConfigureAction?: (index: number) => void;
  onDeleteAction?: (index: number) => void;
  onViewAllLogs?: () => void;
  onViewRunDetails?: (runId: string) => void;
}

export function WorkspaceTabs({
  workspace,
  onConnectForm,
  onViewAnalytics,
  onEditForm,
  onAddAction,
  onConfigureAction,
  onDeleteAction,
  onViewAllLogs,
  onViewRunDetails,
}: WorkspaceTabsProps) {
  return (
    <Tabs defaultValue="forms" className="space-y-6">
      <TabsList>
        <TabsTrigger value="forms">
          Connected Forms ({workspace.forms.length})
        </TabsTrigger>
        <TabsTrigger value="actions">
          Actions ({workspace.actions.length})
        </TabsTrigger>
        <TabsTrigger value="runs">Recent Runs</TabsTrigger>
      </TabsList>

      <TabsContent value="forms">
        <ConnectedFormsTab
          forms={workspace.forms}
          onConnectForm={onConnectForm}
          onViewAnalytics={onViewAnalytics}
          onEditForm={onEditForm}
        />
      </TabsContent>

      <TabsContent value="actions">
        <ActionsTab
          actions={workspace.actions}
          onAddAction={onAddAction}
          onConfigureAction={onConfigureAction}
          onDeleteAction={onDeleteAction}
        />
      </TabsContent>

      <TabsContent value="runs">
        <RecentRunsTab
          runs={workspace.recentRuns}
          onViewAllLogs={onViewAllLogs}
          onViewRunDetails={onViewRunDetails}
        />
      </TabsContent>
    </Tabs>
  );
}
