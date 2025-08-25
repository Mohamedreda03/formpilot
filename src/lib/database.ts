import { databases } from "./appwrite";
import { ID, Query } from "appwrite";

// Database configuration
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

// Collection IDs from environment variables
export const COLLECTIONS = {
  USERS: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
  FORMS: process.env.NEXT_PUBLIC_APPWRITE_FORMS_COLLECTION_ID!,
  SUBMISSIONS: process.env.NEXT_PUBLIC_APPWRITE_SUBMISSIONS_COLLECTION_ID!,
  TEMPLATES: process.env.NEXT_PUBLIC_APPWRITE_TEMPLATES_COLLECTION_ID!,
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
