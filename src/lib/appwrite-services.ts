import { databases, account } from "@/lib/appwrite";
import { ID, Query, Permission, Role } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const WORKSPACES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_COLLECTION_ID!;
const FORMS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_FORMS_COLLECTION_ID!;
const WORKSPACE_MEMBERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_MEMBERS_COLLECTION_ID!;

export interface Workspace {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  name: string;
  description?: string;
  ownerId: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
  formsCount?: number;
  membersCount?: number;
}

export interface Form {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  title: string;
  description?: string;
  questions: string;
  introTitle?: string;
  introDescription?: string;
  introButtonText?: string;
  outroTitle?: string;
  outroDescription?: string;
  outroButtonText?: string;
  userId: string;
  workspaceId?: string;
  isPublic?: boolean;
  isActive?: boolean;
  submissionCount?: number;
  slug?: string;
}

// Get current user ID for permissions
async function getCurrentUserId(): Promise<string> {
  try {
    const user = await account.get();
    return user.$id;
  } catch (error) {
    console.error("Error getting current user:", error);
    throw new Error("User not authenticated");
  }
}

// Check if user has access to workspace (owner or member)
async function checkWorkspaceAccess(
  workspaceId: string,
  requiredRoles?: string[]
): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();

    // First, check if user is the owner of the workspace
    const workspace = (await databases.getDocument(
      DATABASE_ID,
      WORKSPACES_COLLECTION_ID,
      workspaceId
    )) as unknown as Workspace;

    if (workspace.ownerId === userId) {
      return true; // Owner always has access
    }

    // If not owner, check if user is a member with appropriate role
    const membershipQuery = [
      Query.equal("workspaceId", workspaceId),
      Query.equal("userId", userId),
      Query.equal("status", "active"),
    ];

    if (requiredRoles && requiredRoles.length > 0) {
      membershipQuery.push(Query.equal("role", requiredRoles));
    }

    const membershipResponse = await databases.listDocuments(
      DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_MEMBERS_COLLECTION_ID!,
      membershipQuery
    );

    return membershipResponse.documents.length > 0;
  } catch (error) {
    console.error("Error checking workspace access:", error);
    // If user is not authenticated, return false instead of throwing
    if (
      error instanceof Error &&
      error.message.includes("User not authenticated")
    ) {
      return false;
    }
    return false;
  }
}

// Workspace Services
export const workspaceService = {
  // Get all workspaces for the current user
  getWorkspaces: async (): Promise<Workspace[]> => {
    try {
      const userId = await getCurrentUserId();

      // Get workspaces where user is the owner
      const ownedWorkspacesResponse = await databases.listDocuments(
        DATABASE_ID,
        WORKSPACES_COLLECTION_ID,
        [
          Query.equal("ownerId", userId),
          Query.orderDesc("$createdAt"),
          Query.limit(50), // Limit to 50 workspaces for better performance
        ]
      );

      // Get all workspace memberships for the current user
      const membershipResponse = await databases.listDocuments(
        DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_MEMBERS_COLLECTION_ID!,
        [
          Query.equal("userId", userId),
          Query.equal("status", "active"),
          Query.orderDesc("joinedAt"),
          Query.limit(50), // Limit for performance
        ]
      );

      // Extract workspace IDs from memberships (exclude owned workspaces to avoid duplicates)
      const ownedWorkspaceIds = ownedWorkspacesResponse.documents.map(
        (ws: any) => ws.$id
      );
      const memberWorkspaceIds = membershipResponse.documents
        .map((membership: any) => membership.workspaceId)
        .filter((id: string) => !ownedWorkspaceIds.includes(id));

      let memberWorkspaces: any[] = [];
      if (memberWorkspaceIds.length > 0) {
        // Get the actual workspace documents for memberships
        const memberWorkspacesResponse = await databases.listDocuments(
          DATABASE_ID,
          WORKSPACES_COLLECTION_ID,
          [
            Query.equal("$id", memberWorkspaceIds),
            Query.orderDesc("$createdAt"),
          ]
        );
        memberWorkspaces = memberWorkspacesResponse.documents;
      }

      // Combine owned workspaces and member workspaces
      const allWorkspaces = [
        ...ownedWorkspacesResponse.documents,
        ...memberWorkspaces,
      ];

      // Sort by creation date (newest first)
      allWorkspaces.sort(
        (a: any, b: any) =>
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
      );

      return allWorkspaces as unknown as Workspace[];
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      throw error;
    }
  },

  // Get a single workspace
  getWorkspace: async (workspaceId: string): Promise<Workspace> => {
    try {
      const userId = await getCurrentUserId();

      // Get the workspace document first
      const workspace = (await databases.getDocument(
        DATABASE_ID,
        WORKSPACES_COLLECTION_ID,
        workspaceId
      )) as unknown as Workspace;

      // Check if user is the owner
      if (workspace.ownerId === userId) {
        return workspace;
      }

      // If not owner, check if user is a member
      const membershipResponse = await databases.listDocuments(
        DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_MEMBERS_COLLECTION_ID!,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("userId", userId),
          Query.equal("status", "active"),
        ]
      );

      if (membershipResponse.documents.length === 0) {
        throw new Error(
          "Access denied: You are not a member of this workspace"
        );
      }

      return workspace;
    } catch (error) {
      console.error("Error fetching workspace:", error);
      throw error;
    }
  },

  // Create a new workspace
  createWorkspace: async (data: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
  }): Promise<Workspace> => {
    try {
      const userId = await getCurrentUserId();

      // Get current user details
      const user = await account.get();

      // Create the workspace document
      const workspaceResponse = await databases.createDocument(
        DATABASE_ID,
        WORKSPACES_COLLECTION_ID,
        ID.unique(),
        {
          name: data.name,
          description: data.description || "",
          ownerId: userId,
          color: data.color || "#3b82f6",
          icon: data.icon || "folder",
          isActive: true,
          formsCount: 0,
          membersCount: 1,
        },
        [
          Permission.read(Role.user(userId)),
          Permission.write(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );

      // Add the creator as an owner member in workspace_members
      await databases.createDocument(
        DATABASE_ID,
        WORKSPACE_MEMBERS_COLLECTION_ID,
        ID.unique(),
        {
          workspaceId: workspaceResponse.$id,
          userId: userId,
          userEmail: user.email,
          userName: user.name,
          role: "owner",
          joinedAt: new Date().toISOString(),
          status: "active",
        }
      );

      return workspaceResponse as unknown as Workspace;
    } catch (error) {
      console.error("Error creating workspace:", error);
      throw error;
    }
  },

  // Update workspace
  updateWorkspace: async (
    workspaceId: string,
    data: Partial<Omit<Workspace, "$id" | "$createdAt" | "$updatedAt">>
  ): Promise<Workspace> => {
    try {
      const userId = await getCurrentUserId();

      // Get the workspace to check permissions
      const workspace = (await databases.getDocument(
        DATABASE_ID,
        WORKSPACES_COLLECTION_ID,
        workspaceId
      )) as unknown as Workspace;

      // Check if user is the owner
      if (workspace.ownerId !== userId) {
        // If not owner, check if user is admin/member with update permissions
        const membershipResponse = await databases.listDocuments(
          DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_MEMBERS_COLLECTION_ID!,
          [
            Query.equal("workspaceId", workspaceId),
            Query.equal("userId", userId),
            Query.equal("status", "active"),
            Query.equal("role", ["owner", "admin"]), // Only owners and admins can update
          ]
        );

        if (membershipResponse.documents.length === 0) {
          throw new Error(
            "Access denied: You don't have permission to update this workspace"
          );
        }
      }

      const response = await databases.updateDocument(
        DATABASE_ID,
        WORKSPACES_COLLECTION_ID,
        workspaceId,
        data
      );
      return response as unknown as Workspace;
    } catch (error) {
      console.error("Error updating workspace:", error);
      throw error;
    }
  },

  // Delete workspace
  deleteWorkspace: async (workspaceId: string): Promise<void> => {
    try {
      const userId = await getCurrentUserId();

      // Get the workspace to check permissions
      const workspace = (await databases.getDocument(
        DATABASE_ID,
        WORKSPACES_COLLECTION_ID,
        workspaceId
      )) as unknown as Workspace;

      // Only the owner can delete a workspace
      if (workspace.ownerId !== userId) {
        throw new Error(
          "Access denied: Only the workspace owner can delete this workspace"
        );
      }

      // Delete all workspace members first
      const membersResponse = await databases.listDocuments(
        DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_MEMBERS_COLLECTION_ID!,
        [Query.equal("workspaceId", workspaceId)]
      );

      for (const member of membersResponse.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_MEMBERS_COLLECTION_ID!,
          member.$id
        );
      }

      // Delete the workspace
      await databases.deleteDocument(
        DATABASE_ID,
        WORKSPACES_COLLECTION_ID,
        workspaceId
      );
    } catch (error) {
      console.error("Error deleting workspace:", error);
      throw error;
    }
  },
};

// Form Services
export const formService = {
  // Get all forms for a workspace with optional sorting
  getForms: async (workspaceId: string, sortBy?: string): Promise<Form[]> => {
    try {
      console.log("getForms called with:", { workspaceId, sortBy }); // Debug log

      // Check if user has access to this workspace
      const hasAccess = await checkWorkspaceAccess(workspaceId);
      if (!hasAccess) {
        throw new Error(
          "Access denied: You are not a member of this workspace"
        );
      }

      // Build query array with workspace filter
      const queryArray = [
        Query.equal("workspaceId", workspaceId),
        Query.limit(50), // Reduced limit for better performance
      ];

      // Add sorting based on sortBy parameter - simplified for better compatibility
      switch (sortBy) {
        case "created_date":
          queryArray.push(Query.orderDesc("$createdAt"));
          console.log("Added sort: created_date DESC"); // Debug log
          break;
        case "modified_date":
          queryArray.push(Query.orderDesc("$updatedAt"));
          console.log("Added sort: modified_date DESC"); // Debug log
          break;
        case "alphabetical":
          queryArray.push(Query.orderAsc("title"));
          console.log("Added sort: alphabetical ASC"); // Debug log
          break;
        default:
          // Default to newest first by creation date
          queryArray.push(Query.orderDesc("$createdAt"));
          console.log("Added sort: default created_date DESC"); // Debug log
          break;
      }

      console.log("Final query array:", queryArray); // Debug log

      // Get forms for the workspace with sorting applied in database
      const response = await databases.listDocuments(
        DATABASE_ID,
        FORMS_COLLECTION_ID,
        queryArray
      );

      console.log("Database response:", response.documents.length, "forms"); // Debug log
      return response.documents as unknown as Form[];
    } catch (error) {
      console.error("Error fetching forms:", error);
      // If it's an authentication error, throw a more specific error
      if (error instanceof Error) {
        if (error.message.includes("User not authenticated")) {
          throw new Error("Please log in to access workspace forms");
        }
        if (error.message.includes("Access denied")) {
          throw error;
        }
      }
      throw new Error("Failed to load workspace forms");
    }
  },

  // Create a new form
  createForm: async (data: {
    title: string;
    description?: string;
    workspaceId?: string;
    questions?: any;
  }): Promise<Form> => {
    try {
      const userId = await getCurrentUserId();

      // If workspaceId is provided, check if user has access
      if (data.workspaceId) {
        const hasAccess = await checkWorkspaceAccess(data.workspaceId);
        if (!hasAccess) {
          throw new Error(
            "Access denied: You are not a member of this workspace"
          );
        }
      }

      // Create default question if no questions provided
      const defaultQuestions =
        data.questions && data.questions.length > 0
          ? data.questions
          : [
              {
                id: ID.unique(),
                type: "text",
                title: "What's your name?",
                description: "Please enter your full name",
                required: true,
                order: 0,
                placeholder: "Enter your name here...",
              },
            ];

      const response = await databases.createDocument(
        DATABASE_ID,
        FORMS_COLLECTION_ID,
        ID.unique(),
        {
          title: data.title,
          description: data.description || "",
          questions: JSON.stringify(defaultQuestions),
          introTitle: "Welcome to the survey",
          introDescription:
            "We value your time — please take a few minutes to complete this survey.",
          introButtonText: "Get Started",
          outroTitle: "Thank you for your time",
          outroDescription: "Your responses have been submitted successfully.",
          outroButtonText: "Submit",
          userId: userId,
          workspaceId: data.workspaceId || "",
          isPublic: false,
          isActive: true,
          submissionCount: 0,
          slug: data.title
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, ""),
        },
        [
          Permission.read(Role.user(userId)),
          Permission.write(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );
      return response as unknown as Form;
    } catch (error) {
      console.error("Error creating form:", error);
      throw error;
    }
  },

  // Update form
  updateForm: async (
    formId: string,
    data: Partial<Omit<Form, "$id" | "$createdAt" | "$updatedAt">>
  ): Promise<Form> => {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        FORMS_COLLECTION_ID,
        formId,
        data
      );
      return response as unknown as Form;
    } catch (error) {
      console.error("Error updating form:", error);
      throw error;
    }
  },

  // Delete form
  deleteForm: async (formId: string): Promise<void> => {
    try {
      await databases.deleteDocument(DATABASE_ID, FORMS_COLLECTION_ID, formId);
    } catch (error) {
      console.error("Error deleting form:", error);
      throw error;
    }
  },
};
