import { useState, useEffect } from "react";

// Mock data - في التطبيق الحقيقي سيأتي من قاعدة البيانات
const workspacesData = {
  wf_1: {
    id: "wf_1",
    name: "Contact Form Handler",
    description: "Email notifications for contact form submissions",
    status: "active" as const,
    created: "2024-01-15",
    lastRun: "2 hours ago",
    totalRuns: 127,
    successRate: 98.4,
    avgRunTime: "1.2s",
    forms: [
      {
        id: "form_1",
        name: "Contact Form",
        status: "active" as const,
        submissions: 45,
        lastSubmission: "2 hours ago",
        conversionRate: 19.2,
      },
      {
        id: "form_2",
        name: "Support Request",
        status: "active" as const,
        submissions: 23,
        lastSubmission: "5 hours ago",
        conversionRate: 34.3,
      },
      {
        id: "form_3",
        name: "Bug Report",
        status: "active" as const,
        submissions: 12,
        lastSubmission: "1 day ago",
        conversionRate: 67.8,
      },
    ],
    actions: [
      {
        type: "email" as const,
        config: { to: "admin@company.com", template: "contact-notification" },
      },
      {
        type: "slack" as const,
        config: { channel: "#support", message: "New contact form submission" },
      },
    ],
    recentRuns: [
      {
        id: "run_1",
        status: "success" as const,
        timestamp: "2 hours ago",
        duration: "1.1s",
        trigger: "Form submission from Contact Form",
      },
      {
        id: "run_2",
        status: "success" as const,
        timestamp: "4 hours ago",
        duration: "0.9s",
        trigger: "Form submission from Support Request",
      },
      {
        id: "run_3",
        status: "success" as const,
        timestamp: "6 hours ago",
        duration: "1.3s",
        trigger: "Form submission from Contact Form",
      },
      {
        id: "run_4",
        status: "failed" as const,
        timestamp: "1 day ago",
        duration: "2.1s",
        trigger: "Form submission from Bug Report",
      },
    ],
  },
  wf_2: {
    id: "wf_2",
    name: "Newsletter Automation",
    description: "CRM integration for newsletter signups",
    status: "active" as const,
    created: "2024-01-10",
    lastRun: "1 day ago",
    totalRuns: 82,
    successRate: 95.1,
    avgRunTime: "2.8s",
    forms: [
      {
        id: "form_4",
        name: "Newsletter Signup",
        status: "active" as const,
        submissions: 82,
        lastSubmission: "1 day ago",
        conversionRate: 52.6,
      },
    ],
    actions: [
      {
        type: "webhook" as const,
        config: { url: "https://api.crm.com/contacts", method: "POST" },
      },
      {
        type: "database" as const,
        config: { table: "subscribers", action: "insert" },
      },
    ],
    recentRuns: [
      {
        id: "run_5",
        status: "success" as const,
        timestamp: "1 day ago",
        duration: "2.7s",
        trigger: "Form submission from Newsletter Signup",
      },
      {
        id: "run_6",
        status: "success" as const,
        timestamp: "2 days ago",
        duration: "2.9s",
        trigger: "Form submission from Newsletter Signup",
      },
    ],
  },
  wf_3: {
    id: "wf_3",
    name: "Support Ticket Creation",
    description: "Auto-create support tickets from forms",
    status: "paused" as const,
    created: "2024-01-08",
    lastRun: "3 days ago",
    totalRuns: 23,
    successRate: 87.0,
    avgRunTime: "3.2s",
    forms: [
      {
        id: "form_5",
        name: "Technical Support",
        status: "active" as const,
        submissions: 15,
        lastSubmission: "3 days ago",
        conversionRate: 78.9,
      },
      {
        id: "form_6",
        name: "Billing Support",
        status: "active" as const,
        submissions: 8,
        lastSubmission: "5 days ago",
        conversionRate: 45.2,
      },
    ],
    actions: [
      {
        type: "webhook" as const,
        config: { url: "https://api.helpdesk.com/tickets", method: "POST" },
      },
      {
        type: "email" as const,
        config: { to: "support@company.com", template: "ticket-created" },
      },
    ],
    recentRuns: [
      {
        id: "run_7",
        status: "success" as const,
        timestamp: "3 days ago",
        duration: "3.1s",
        trigger: "Form submission from Technical Support",
      },
      {
        id: "run_8",
        status: "failed" as const,
        timestamp: "4 days ago",
        duration: "5.2s",
        trigger: "Form submission from Billing Support",
      },
    ],
  },
};

export type WorkspaceData = {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "error";
  created: string;
  lastRun: string;
  totalRuns: number;
  successRate: number;
  avgRunTime: string;
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

export function useWorkspaceData(workspaceId: string) {
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const workspaceData =
          workspacesData[workspaceId as keyof typeof workspacesData];

        if (!workspaceData) {
          setError("Workflow not found");
          setWorkspace(null);
        } else {
          setWorkspace(workspaceData);
        }
      } catch (err) {
        setError("Failed to load workspace");
        setWorkspace(null);
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      loadWorkspace();
    }
  }, [workspaceId]);

  const updateWorkspaceStatus = async (status: "active" | "paused") => {
    if (!workspace) return;

    try {
      // في التطبيق الحقيقي سيتم إرسال طلب إلى API
      console.log(`Updating workspace ${workspace.id} status to ${status}`);

      setWorkspace((prev) =>
        prev ? ({ ...prev, status } as WorkspaceData) : null
      );
    } catch (err) {
      console.error("Failed to update workspace status:", err);
    }
  };

  const connectForm = async (formId: string) => {
    if (!workspace) return;

    try {
      console.log(`Connecting form ${formId} to workspace ${workspace.id}`);
      // في التطبيق الحقيقي سيتم إرسال طلب إلى API
    } catch (err) {
      console.error("Failed to connect form:", err);
    }
  };

  const addAction = async (
    actionType: "email" | "slack" | "webhook" | "database",
    config: any
  ) => {
    if (!workspace) return;

    try {
      console.log(`Adding ${actionType} action to workspace ${workspace.id}`);
      // في التطبيق الحقيقي سيتم إرسال طلب إلى API

      const newAction = { type: actionType, config };
      setWorkspace((prev) =>
        prev
          ? ({
              ...prev,
              actions: [...prev.actions, newAction],
            } as WorkspaceData)
          : null
      );
    } catch (err) {
      console.error("Failed to add action:", err);
    }
  };

  const deleteAction = async (actionIndex: number) => {
    if (!workspace) return;

    try {
      console.log(
        `Deleting action ${actionIndex} from workspace ${workspace.id}`
      );
      // في التطبيق الحقيقي سيتم إرسال طلب إلى API

      setWorkspace((prev) =>
        prev
          ? ({
              ...prev,
              actions: prev.actions.filter((_, index) => index !== actionIndex),
            } as WorkspaceData)
          : null
      );
    } catch (err) {
      console.error("Failed to delete action:", err);
    }
  };

  return {
    workspace,
    loading,
    error,
    updateWorkspaceStatus,
    connectForm,
    addAction,
    deleteAction,
  };
}
