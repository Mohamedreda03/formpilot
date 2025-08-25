import { databases, account } from "@/lib/appwrite";
import { ID, Query, Permission, Role } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const WORKSPACES_COLLECTION_ID = "workspaces";
const FORMS_COLLECTION_ID = "forms";

export interface Workspace {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  name: string;
  description?: string;
  status: "active" | "paused";
  isDefault?: boolean;
  ownerId: string;
}

export interface Form {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  name: string;
  description?: string;
  workspaceId: string;
  status: "active" | "inactive";
  formData?: any;
  submissions?: number;
  ownerId: string;
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

// Workspace Services
export const workspaceService = {
  // Get all workspaces for the current user
  getWorkspaces: async (): Promise<Workspace[]> => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        WORKSPACES_COLLECTION_ID,
        [Query.orderDesc("$createdAt")]
      );
      // Appwrite automatically filters by user permissions
      return response.documents as unknown as Workspace[];
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      throw error;
    }
  },

  // Get a single workspace
  getWorkspace: async (workspaceId: string): Promise<Workspace> => {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        WORKSPACES_COLLECTION_ID,
        workspaceId
      );
      return response as unknown as Workspace;
    } catch (error) {
      console.error("Error fetching workspace:", error);
      throw error;
    }
  },

  // Create a new workspace
  createWorkspace: async (data: {
    name: string;
    description?: string;
    isDefault?: boolean;
  }): Promise<Workspace> => {
    try {
      const userId = await getCurrentUserId();

      const response = await databases.createDocument(
        DATABASE_ID,
        WORKSPACES_COLLECTION_ID,
        ID.unique(),
        {
          name: data.name,
          description: data.description || "",
          status: "active",
          isDefault: data.isDefault || false,
          ownerId: userId,
        },
        [
          Permission.read(Role.user(userId)),
          Permission.write(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );
      return response as unknown as Workspace;
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
  // Get all forms for a workspace
  getForms: async (workspaceId: string): Promise<Form[]> => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        FORMS_COLLECTION_ID,
        [Query.equal("workspaceId", workspaceId), Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as Form[];
    } catch (error) {
      console.error("Error fetching forms:", error);
      throw error;
    }
  },

  // Create a new form
  createForm: async (data: {
    name: string;
    description?: string;
    workspaceId: string;
  }): Promise<Form> => {
    try {
      const userId = await getCurrentUserId();

      const response = await databases.createDocument(
        DATABASE_ID,
        FORMS_COLLECTION_ID,
        ID.unique(),
        {
          name: data.name,
          description: data.description || "",
          workspaceId: data.workspaceId,
          status: "active",
          submissions: 0,
          ownerId: userId,
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
