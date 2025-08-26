import { Client, Databases, Account, Storage } from "appwrite";

// Appwrite configuration
const client = new Client();

// Replace with your Appwrite project details
client
  .setEndpoint(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
  )
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "your-project-id");

// Services
export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);

// Database and Collection IDs
export const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "formpilot-db";

export const COLLECTIONS = {
  WORKSPACES:
    process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_COLLECTION_ID || "workspaces",
  FORMS: process.env.NEXT_PUBLIC_APPWRITE_FORMS_COLLECTION_ID || "forms",
  FORM_RESPONSES:
    process.env.NEXT_PUBLIC_APPWRITE_FORM_RESPONSES_COLLECTION_ID ||
    "form_responses",
  WORKSPACE_MEMBERS:
    process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_MEMBERS_COLLECTION_ID ||
    "workspace_members",
  WORKSPACE_INVITES:
    process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_INVITES_COLLECTION_ID ||
    "workspace_invites",
} as const;

// Storage Buckets
export const BUCKETS = {
  AVATARS: process.env.NEXT_PUBLIC_APPWRITE_AVATARS_BUCKET_ID || "avatars",
  FORM_ATTACHMENTS:
    process.env.NEXT_PUBLIC_APPWRITE_FORM_ATTACHMENTS_BUCKET_ID ||
    "form_attachments",
} as const;

export default client;
