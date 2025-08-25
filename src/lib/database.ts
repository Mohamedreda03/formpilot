import { databases, account } from "./appwrite";
import { ID, Query } from "appwrite";

// Database configuration
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

// Get current user ID
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
async function checkWorkspaceAccess(workspaceId: string, requiredRoles?: string[]): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    
    // First, check if user is the owner of the workspace
    const workspace = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.WORKSPACES,
      workspaceId
    );

    if (workspace.ownerId === userId) {
      return true; // Owner always has access
    }

    // If not owner, check if user is a member with appropriate role
    const membershipQuery = [
      Query.equal("workspaceId", workspaceId),
      Query.equal("userId", userId),
      Query.equal("status", "active")
    ];

    if (requiredRoles && requiredRoles.length > 0) {
      membershipQuery.push(Query.equal("role", requiredRoles));
    }

    const membershipResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.WORKSPACE_MEMBERS,
      membershipQuery
    );

    return membershipResponse.documents.length > 0;
  } catch (error) {
    console.error("Error checking workspace access:", error);
    // If user is not authenticated, return false instead of throwing
    if (error instanceof Error && error.message.includes("User not authenticated")) {
      return false;
    }
    return false;
  }
}

// Collection IDs from environment variables
export const COLLECTIONS = {
  USERS: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
  FORMS: process.env.NEXT_PUBLIC_APPWRITE_FORMS_COLLECTION_ID!,
  SUBMISSIONS: process.env.NEXT_PUBLIC_APPWRITE_SUBMISSIONS_COLLECTION_ID!,
  TEMPLATES: process.env.NEXT_PUBLIC_APPWRITE_TEMPLATES_COLLECTION_ID!,
  WORKSPACES: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_COLLECTION_ID!,
  WORKSPACE_MEMBERS:
    process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_MEMBERS_COLLECTION_ID!,
  WORKSPACE_INVITES:
    process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_INVITES_COLLECTION_ID!,
} as const;

// User database operations
export const userDB = {
  async createUser(
    userId: string,
    data: {
      name: string;
      email: string;
      subscription?: string;
      credits?: number;
    }
  ) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        {
          name: data.name,
          email: data.email,
          subscription: data.subscription || "free",
          credits: data.credits || 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error("Error creating user document:", error);
      throw error;
    }
  },

  async getUser(userId: string) {
    try {
      return await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId
      );
    } catch (error) {
      console.error("Error getting user document:", error);
      throw error;
    }
  },

  async updateUser(
    userId: string,
    data: Partial<{
      name: string;
      subscription: string;
      credits: number;
    }>
  ) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        {
          ...data,
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error("Error updating user document:", error);
      throw error;
    }
  },
};

// Form database operations
export const formDB = {
  async createForm(data: {
    title: string;
    description?: string;
    fields: any[];
    userId: string;
    isPublic?: boolean;
  }) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.FORMS,
        ID.unique(),
        {
          title: data.title,
          description: data.description || "",
          fields: JSON.stringify(data.fields),
          userId: data.userId,
          isPublic: data.isPublic || false,
          submissionCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error("Error creating form:", error);
      throw error;
    }
  },

  async getUserForms(userId: string) {
    try {
      return await databases.listDocuments(DATABASE_ID, COLLECTIONS.FORMS, [
        Query.equal("userId", userId),
        Query.orderDesc("createdAt"),
      ]);
    } catch (error) {
      console.error("Error getting user forms:", error);
      throw error;
    }
  },

  async getForm(formId: string) {
    try {
      return await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.FORMS,
        formId
      );
    } catch (error) {
      console.error("Error getting form:", error);
      throw error;
    }
  },

  async updateForm(
    formId: string,
    data: Partial<{
      title: string;
      description: string;
      fields: any[];
      isPublic: boolean;
    }>
  ) {
    try {
      const updateData: any = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      if (data.fields) {
        updateData.fields = JSON.stringify(data.fields);
      }

      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.FORMS,
        formId,
        updateData
      );
    } catch (error) {
      console.error("Error updating form:", error);
      throw error;
    }
  },

  async deleteForm(formId: string) {
    try {
      return await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.FORMS,
        formId
      );
    } catch (error) {
      console.error("Error deleting form:", error);
      throw error;
    }
  },
};

// Submission database operations
export const submissionDB = {
  async createSubmission(data: {
    formId: string;
    responses: any;
    submitterEmail?: string;
    submitterName?: string;
  }) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.SUBMISSIONS,
        ID.unique(),
        {
          formId: data.formId,
          responses: JSON.stringify(data.responses),
          submitterEmail: data.submitterEmail || "",
          submitterName: data.submitterName || "",
          submittedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error("Error creating submission:", error);
      throw error;
    }
  },

  async getFormSubmissions(formId: string) {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SUBMISSIONS,
        [Query.equal("formId", formId), Query.orderDesc("submittedAt")]
      );
    } catch (error) {
      console.error("Error getting form submissions:", error);
      throw error;
    }
  },
};

// Template database operations
export const templateDB = {
  async getTemplates() {
    try {
      return await databases.listDocuments(DATABASE_ID, COLLECTIONS.TEMPLATES, [
        Query.orderDesc("createdAt"),
      ]);
    } catch (error) {
      console.error("Error getting templates:", error);
      throw error;
    }
  },

  async getTemplate(templateId: string) {
    try {
      return await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.TEMPLATES,
        templateId
      );
    } catch (error) {
      console.error("Error getting template:", error);
      throw error;
    }
  },
};

// Workspace Members database operations
export const workspaceMemberDB = {
  async createMember(data: {
    workspaceId: string;
    userId: string;
    userEmail: string;
    userName: string;
    userAvatar?: string;
    role: "owner" | "admin" | "member" | "viewer";
    invitedBy?: string;
  }) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.WORKSPACE_MEMBERS,
        ID.unique(),
        {
          workspaceId: data.workspaceId,
          userId: data.userId,
          userEmail: data.userEmail,
          userName: data.userName,
          userAvatar: data.userAvatar || null,
          role: data.role,
          status: "active",
          joinedAt: new Date().toISOString(),
          invitedBy: data.invitedBy || null,
        }
      );
    } catch (error) {
      console.error("Error creating workspace member:", error);
      throw error;
    }
  },

  async getWorkspaceMembers(workspaceId: string) {
    try {
      // Check if current user has access to this workspace
      const hasAccess = await checkWorkspaceAccess(workspaceId);
      if (!hasAccess) {
        throw new Error("Access denied: You are not a member of this workspace");
      }

      // Get all members of the workspace
      return await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.WORKSPACE_MEMBERS,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("status", "active"),
          Query.orderAsc("joinedAt"),
        ]
      );
    } catch (error) {
      console.error("Error getting workspace members:", error);
      // If it's an authentication error, throw a more specific error
      if (error instanceof Error) {
        if (error.message.includes("User not authenticated")) {
          throw new Error("Please log in to access workspace members");
        }
        if (error.message.includes("Access denied")) {
          throw error;
        }
      }
      throw new Error("Failed to load workspace members");
    }
  },

  async updateMemberRole(
    memberId: string,
    role: "admin" | "member" | "viewer"
  ) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.WORKSPACE_MEMBERS,
        memberId,
        { role }
      );
    } catch (error) {
      console.error("Error updating member role:", error);
      throw error;
    }
  },

  async removeMember(memberId: string) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.WORKSPACE_MEMBERS,
        memberId,
        { status: "removed" }
      );
    } catch (error) {
      console.error("Error removing member:", error);
      throw error;
    }
  },

  async getUserRole(workspaceId: string, userId: string) {
    try {
      const currentUserId = await getCurrentUserId();
      
      // Users can only check their own role OR if they have access to the workspace
      if (currentUserId !== userId) {
        // Check if current user has access to this workspace
        const hasAccess = await checkWorkspaceAccess(workspaceId);
        if (!hasAccess) {
          throw new Error("Access denied: You are not a member of this workspace");
        }
      }

      // First, check if the user is the owner of the workspace
      const workspace = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.WORKSPACES,
        workspaceId
      );

      if (workspace.ownerId === userId) {
        // Return a mock WorkspaceMember object for the owner
        return {
          $id: "owner-" + userId,
          workspaceId: workspaceId,
          userId: userId,
          userEmail: "", // Will be filled by the component if needed
          userName: "", // Will be filled by the component if needed
          role: "owner",
          joinedAt: workspace.$createdAt,
          status: "active"
        };
      }

      // If not owner, check workspace_members table
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.WORKSPACE_MEMBERS,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("userId", userId),
          Query.equal("status", "active"),
        ]
      );
      return result.documents[0] || null;
    } catch (error) {
      console.error("Error getting user role:", error);
      throw error;
    }
  },
};

// Workspace Invites database operations
export const workspaceInviteDB = {
  async createInvite(data: {
    workspaceId: string;
    email: string;
    role: "admin" | "member" | "viewer";
    invitedBy: string;
    token: string;
    expiresAt: string;
  }) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.WORKSPACE_INVITES,
        ID.unique(),
        {
          workspaceId: data.workspaceId,
          email: data.email,
          role: data.role,
          status: "pending",
          invitedBy: data.invitedBy,
          createdAt: new Date().toISOString(),
          expiresAt: data.expiresAt,
          token: data.token,
        }
      );
    } catch (error) {
      console.error("Error creating workspace invite:", error);
      throw error;
    }
  },

  async getWorkspaceInvites(workspaceId: string) {
    try {
      // Check if current user has access to this workspace
      const hasAccess = await checkWorkspaceAccess(workspaceId);
      if (!hasAccess) {
        throw new Error("Access denied: You are not a member of this workspace");
      }

      return await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.WORKSPACE_INVITES,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("status", "pending"),
          Query.orderDesc("createdAt"),
        ]
      );
    } catch (error) {
      console.error("Error getting workspace invites:", error);
      // If it's an authentication error, throw a more specific error
      if (error instanceof Error) {
        if (error.message.includes("User not authenticated")) {
          throw new Error("Please log in to access workspace invites");
        }
        if (error.message.includes("Access denied")) {
          throw error;
        }
      }
      throw new Error("Failed to load workspace invites");
    }
  },

  async updateInviteStatus(
    inviteId: string,
    status: "accepted" | "expired" | "cancelled"
  ) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.WORKSPACE_INVITES,
        inviteId,
        { status }
      );
    } catch (error) {
      console.error("Error updating invite status:", error);
      throw error;
    }
  },

  async getInviteByToken(token: string) {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.WORKSPACE_INVITES,
        [Query.equal("token", token), Query.equal("status", "pending")]
      );
      return result.documents[0] || null;
    } catch (error) {
      console.error("Error getting invite by token:", error);
      throw error;
    }
  },

  async getByToken(token: string) {
    return this.getInviteByToken(token);
  },

  async getByWorkspaceAndEmail(workspaceId: string, email: string) {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.WORKSPACE_INVITES,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("email", email),
          Query.equal("status", "pending"),
        ]
      );
      return result.documents[0] || null;
    } catch (error) {
      console.error("Error getting invite by workspace and email:", error);
      throw error;
    }
  },

  async acceptInvite(inviteId: string, userId: string) {
    try {
      // Get the invite details first
      const invite = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.WORKSPACE_INVITES,
        inviteId
      );

      // Add user to workspace members
      await workspaceMemberDB.createMember({
        workspaceId: invite.workspaceId,
        userId: userId,
        userEmail: invite.email,
        userName: "", // Will be filled when user data is available
        userAvatar: undefined,
        role: invite.role,
        invitedBy: invite.invitedBy,
      });

      // Update invite status
      await this.updateInviteStatus(inviteId, "accepted");

      return invite;
    } catch (error) {
      console.error("Error accepting invite:", error);
      throw error;
    }
  },

  async declineInvite(inviteId: string) {
    try {
      return await this.updateInviteStatus(inviteId, "cancelled");
    } catch (error) {
      console.error("Error declining invite:", error);
      throw error;
    }
  },
};
