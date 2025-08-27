#!/usr/bin/env node

/**
 * Appwrite Database Setup Script for FormPilot SaaS
 *
 * This script DELETES ALL EXISTING COLLECTIONS and recreates them from scratch.
 * Use this script whenever you need to:
 * - Reset the database structure
 * - Add new collections
 * - Modify existing collection schemas
 *
 * WARNING: This will delete all data in the collections!
 *
 * To add a new collection:
 * 1. Add the collection ID to the config.collections object
 * 2. Add the collection ID to the ALL_COLLECTIONS array
 * 3. Create a new createYourCollection() function
 * 4. Add the function call to setupDatabase()
 *
 * Run this script with: node scripts/setup-database.js
 * Make sure to set your APPWRITE_API_KEY in .env.local first
 */

const {
  Client,
  Databases,
  ID,
  Permission,
  Role,
  IndexType,
} = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

// Configuration
const config = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  apiKey: process.env.APPWRITE_API_KEY,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  collections: {
    forms: process.env.NEXT_PUBLIC_APPWRITE_FORMS_COLLECTION_ID,
    submissions: process.env.NEXT_PUBLIC_APPWRITE_SUBMISSIONS_COLLECTION_ID,
    templates: process.env.NEXT_PUBLIC_APPWRITE_TEMPLATES_COLLECTION_ID,
    workspaces: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_COLLECTION_ID,
    workspaceMembers:
      process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_MEMBERS_COLLECTION_ID,
    workspaceInvites:
      process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_INVITES_COLLECTION_ID,
  },
};

// Initialize Appwrite
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);

// Helper function to add delay between operations
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to create attribute with retry
const createAttributeWithRetry = async (createFunc, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await createFunc();
      await delay(200); // Wait after successful creation
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retrying attribute creation... (${i + 1}/${maxRetries})`);
      await delay(1000); // Wait longer before retry
    }
  }
};

// List of all collections for deletion
const ALL_COLLECTIONS = [
  config.collections.forms,
  config.collections.submissions,
  config.collections.templates,
  config.collections.workspaces,
  config.collections.workspaceMembers,
  config.collections.workspaceInvites,
];

async function deleteAllCollections() {
  console.log("🗑️  Deleting existing collections...\n");

  for (const collectionId of ALL_COLLECTIONS) {
    try {
      await databases.deleteCollection(config.databaseId, collectionId);
      console.log(`✅ Deleted collection: ${collectionId}`);
    } catch (error) {
      if (error.code === 404) {
        console.log(`⚠️  Collection not found: ${collectionId} (skipping)`);
      } else {
        console.log(
          `❌ Failed to delete collection ${collectionId}: ${error.message}`
        );
      }
    }
  }
  console.log("\n🧹 Collection cleanup completed!\n");
}

async function setupDatabase() {
  try {
    console.log("🚀 Starting FormPilot SaaS database setup...\n");

    // Step 1: Delete existing collections
    await deleteAllCollections();

    // Step 2: Create Database
    await createDatabase();

    // Step 3: Wait before creating collections
    await delay(2000);

    // Step 4: Create Collections with delays
    console.log("📝 Creating all collections with proper timing...\n");

    await createFormsCollection();
    await delay(2000);

    await createSubmissionsCollection();
    await delay(2000);

    await createTemplatesCollection();
    await delay(2000);

    await createWorkspacesCollection();
    await delay(2000);

    await createWorkspaceMembersCollection();
    await delay(2000);

    await createWorkspaceInvitesCollection();
    await delay(1000);

    // Diagnostics: log attributes to ensure no stale createdAt/updatedAt custom attributes
    await logCollectionAttributes(config.collections.workspaces, "Workspaces");
    await logCollectionAttributes(
      config.collections.workspaceMembers,
      "Workspace Members"
    );

    console.log("✅ All collections created successfully!");

    console.log("✅ Database setup completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Test creating a new form");
    console.log(
      "2. Verify all collections (no Teams anymore) in Appwrite Console"
    );
    console.log(
      "3. Test workspace creation flow (should NOT ask for createdAt)\n"
    );
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    process.exit(1);
  }
}

async function createDatabase() {
  try {
    console.log("📂 Creating database...");
    await databases.create(
      config.databaseId,
      "FormPilot Database",
      true // enabled
    );
    console.log("✅ Database created successfully");
  } catch (error) {
    if (error.code === 409) {
      console.log("📂 Database already exists, skipping...");
    } else {
      throw error;
    }
  }
}

async function createFormsCollection() {
  console.log("\n📝 Creating Forms collection...");

  try {
    // Create collection
    await databases.createCollection(
      config.databaseId,
      config.collections.forms,
      "Forms",
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      true, // documentSecurity
      true // enabled
    );
    await delay(1000);

    // Create attributes with delays
    console.log("📝 Adding title attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "title",
      255,
      true // required
    );
    await delay(500);

    console.log("📝 Adding description attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "description",
      1000,
      false // optional
    );
    await delay(500);

    console.log("📝 Adding questions attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "questions",
      65535, // Large text for JSON
      false // optional - can have forms without questions initially
    );
    await delay(500);

    console.log("📝 Adding intro attributes...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "introTitle",
      255,
      false // optional
    );
    await delay(500);

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "introDescription",
      1000,
      false // optional
    );
    await delay(500);

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "introButtonText",
      100,
      false // optional
    );
    await delay(500);

    console.log("📝 Adding outro attributes...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "outroTitle",
      255,
      false // optional
    );
    await delay(500);

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "outroDescription",
      1000,
      false // optional
    );
    await delay(500);

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "outroButtonText",
      100,
      false // optional
    );
    await delay(500);

    console.log("📝 Adding settings and metadata...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "settings",
      5000, // JSON for form settings
      false // optional
    );
    await delay(500);

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "userId",
      50,
      true // required
    );
    await delay(500);

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "workspaceId",
      50,
      false // optional - forms can exist without workspace
    );
    await delay(500);

    await databases.createBooleanAttribute(
      config.databaseId,
      config.collections.forms,
      "isPublic",
      false, // optional
      false // default
    );
    await delay(500);

    await databases.createBooleanAttribute(
      config.databaseId,
      config.collections.forms,
      "isActive",
      false, // optional
      true // default
    );
    await delay(500);

    await databases.createIntegerAttribute(
      config.databaseId,
      config.collections.forms,
      "submissionCount",
      false, // optional
      0, // min
      null, // max
      0 // default
    );
    await delay(500);

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "slug",
      255,
      false // optional
    );
    await delay(500);

    console.log("📝 Adding indexes...");
    // Create indexes with delays
    await databases.createIndex(
      config.databaseId,
      config.collections.forms,
      "userId_index",
      "key",
      ["userId"]
    );
    await delay(500);

    await databases.createIndex(
      config.databaseId,
      config.collections.forms,
      "workspaceId_index",
      "key",
      ["workspaceId"]
    );
    await delay(500);

    console.log("✅ Forms collection created successfully");
  } catch (error) {
    console.error("❌ Failed to create Forms collection:", error.message);
    throw error;
  }
}

async function createSubmissionsCollection() {
  console.log("\n📊 Creating Submissions collection...");

  try {
    // Create collection
    await databases.createCollection(
      config.databaseId,
      config.collections.submissions,
      "Submissions",
      [
        Permission.read(Role.users()),
        Permission.create(Role.any()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      true, // documentSecurity
      true // enabled
    );
    await delay(1000);

    console.log("📊 Adding formId attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.submissions,
      "formId",
      50,
      true // required
    );
    await delay(500);

    console.log("📊 Adding responses attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.submissions,
      "responses",
      65535, // Large text for JSON
      true // required
    );
    await delay(500);

    console.log("📊 Adding submitter email attribute...");
    await databases.createEmailAttribute(
      config.databaseId,
      config.collections.submissions,
      "submitterEmail",
      false // optional
    );
    await delay(500);

    console.log("📊 Adding submitter name attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.submissions,
      "submitterName",
      255,
      false // optional
    );
    await delay(500);

    console.log("📊 Adding submitter IP attribute...");
    await databases.createIpAttribute(
      config.databaseId,
      config.collections.submissions,
      "submitterIp",
      false // optional
    );
    await delay(500);

    console.log("📊 Adding user agent attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.submissions,
      "userAgent",
      500,
      false // optional
    );
    await delay(500);

    console.log("📊 Adding submitted date attribute...");
    await databases.createDatetimeAttribute(
      config.databaseId,
      config.collections.submissions,
      "submittedAt",
      true, // required
      null, // no default for required field
      false // not array
    );
    await delay(500);

    console.log("📊 Adding indexes...");
    // Create indexes
    await databases.createIndex(
      config.databaseId,
      config.collections.submissions,
      "formId_index",
      "key",
      ["formId"]
    );
    await delay(500);

    await databases.createIndex(
      config.databaseId,
      config.collections.submissions,
      "submitted_date_index",
      "key",
      ["submittedAt"]
    );
    await delay(500);

    console.log("✅ Submissions collection created successfully");
  } catch (error) {
    console.error("❌ Failed to create Submissions collection:", error.message);
    throw error;
  }
}

async function createTemplatesCollection() {
  console.log("\n🎨 Creating Templates collection...");

  try {
    // Create collection
    await databases.createCollection(
      config.databaseId,
      config.collections.templates,
      "Templates",
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      false, // documentSecurity - templates can be public
      true // enabled
    );
    await delay(1000);

    console.log("🎨 Adding name attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.templates,
      "name",
      255,
      true // required
    );
    await delay(500);

    console.log("🎨 Adding description attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.templates,
      "description",
      1000,
      false // optional
    );
    await delay(500);

    console.log("🎨 Adding category attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.templates,
      "category",
      100,
      true // required
    );
    await delay(500);

    console.log("🎨 Adding fields attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.templates,
      "fields",
      65535, // Large text for JSON
      true // required
    );
    await delay(500);

    console.log("🎨 Adding previewImage attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.templates,
      "previewImage",
      500,
      false // optional
    );
    await delay(500);

    console.log("🎨 Adding tags attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.templates,
      "tags",
      1000,
      false // optional - comma separated
    );
    await delay(500);

    console.log("🎨 Adding difficulty attribute...");
    await databases.createEnumAttribute(
      config.databaseId,
      config.collections.templates,
      "difficulty",
      ["beginner", "intermediate", "advanced"],
      false, // optional
      "beginner" // default
    );
    await delay(500);

    console.log("🎨 Adding usageCount attribute...");
    await databases.createIntegerAttribute(
      config.databaseId,
      config.collections.templates,
      "usageCount",
      false, // optional
      0, // min
      null, // max
      0 // default
    );
    await delay(500);

    console.log("🎨 Adding design attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.templates,
      "design",
      65535, // Large text for JSON design data
      false // optional
    );
    await delay(500);

    console.log("🎨 Adding indexes...");
    // Create indexes
    await databases.createIndex(
      config.databaseId,
      config.collections.templates,
      "category_index",
      "key",
      ["category"]
    );
    await delay(500);

    await databases.createIndex(
      config.databaseId,
      config.collections.templates,
      "difficulty_index",
      "key",
      ["difficulty"]
    );
    await delay(500);

    console.log("✅ Templates collection created successfully");
  } catch (error) {
    console.error("❌ Failed to create Templates collection:", error.message);
    throw error;
  }
}

async function createWorkspacesCollection() {
  console.log("\n🔄 Creating Workspaces collection...");

  try {
    // Create collection
    await databases.createCollection(
      config.databaseId,
      config.collections.workspaces,
      "Workspaces",
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      true, // documentSecurity
      true // enabled
    );
    await delay(1000);

    console.log("🔄 Adding name attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaces,
      "name",
      255,
      true // required
    );
    await delay(500);

    console.log("🔄 Adding description attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaces,
      "description",
      1000,
      false // optional
    );
    await delay(500);

    console.log("🔄 Adding ownerId attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaces,
      "ownerId",
      50,
      true // required - مالك المشروع
    );
    await delay(500);

    console.log("🔄 Adding color attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaces,
      "color",
      20,
      false // optional
    );
    await delay(500);

    console.log("🔄 Adding icon attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaces,
      "icon",
      50,
      false // optional
    );
    await delay(500);

    console.log("🔄 Adding isActive attribute...");
    await databases.createBooleanAttribute(
      config.databaseId,
      config.collections.workspaces,
      "isActive",
      false, // optional
      true // default
    );
    await delay(500);

    console.log("🔄 Adding formsCount attribute...");
    await databases.createIntegerAttribute(
      config.databaseId,
      config.collections.workspaces,
      "formsCount",
      false, // optional
      0, // min
      null, // max
      0 // default
    );
    await delay(500);

    console.log("🔄 Adding membersCount attribute...");
    await databases.createIntegerAttribute(
      config.databaseId,
      config.collections.workspaces,
      "membersCount",
      false, // optional
      0, // min
      null, // max
      1 // default (owner)
    );
    await delay(500);

    console.log("🔄 Adding indexes...");
    // Create indexes
    await databases.createIndex(
      config.databaseId,
      config.collections.workspaces,
      "ownerId_index",
      "key",
      ["ownerId"]
    );
    await delay(500);

    await databases.createIndex(
      config.databaseId,
      config.collections.workspaces,
      "active_workflows_index",
      "key",
      ["isActive"]
    );
    await delay(500);

    console.log("✅ Workspaces collection created successfully");
  } catch (error) {
    console.error("❌ Failed to create Workspaces collection:", error.message);
    throw error;
  }
}

// Diagnostic helper to print attribute keys (and which are required)
async function logCollectionAttributes(collectionId, label) {
  try {
    const col = await databases.getCollection(config.databaseId, collectionId);
    const attrs = (col.attributes || []).map(
      (a) => `${a.key}${a.required ? " (required)" : ""}`
    );
    console.log(`� ${label} attributes: ${attrs.join(", ")}`);
  } catch (e) {
    console.log(`⚠️  Could not fetch attributes for ${label}: ${e.message}`);
  }
}

async function createWorkspaceMembersCollection() {
  console.log("\n👥 Creating Workspace Members collection...");

  try {
    // Create collection
    await databases.createCollection(
      config.databaseId,
      config.collections.workspaceMembers,
      "Workspace Members",
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      true, // documentSecurity
      true // enabled
    );
    await delay(1000);

    console.log("👥 Adding workspaceId attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceMembers,
      "workspaceId",
      50,
      true // required
    );
    await delay(500);

    console.log("👥 Adding userId attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceMembers,
      "userId",
      50,
      true // required
    );
    await delay(500);

    console.log("👥 Adding userEmail attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceMembers,
      "userEmail",
      255,
      true // required
    );
    await delay(500);

    console.log("👥 Adding userName attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceMembers,
      "userName",
      255,
      true // required
    );
    await delay(500);

    console.log("👥 Adding userAvatar attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceMembers,
      "userAvatar",
      500,
      false // optional
    );
    await delay(500);

    console.log("👥 Adding role attribute...");
    await databases.createEnumAttribute(
      config.databaseId,
      config.collections.workspaceMembers,
      "role",
      ["owner", "admin", "member", "viewer"],
      true, // required
      null // no default for required field
    );
    await delay(500);

    console.log("👥 Adding status attribute...");
    await databases.createEnumAttribute(
      config.databaseId,
      config.collections.workspaceMembers,
      "status",
      ["active", "removed"],
      false, // optional
      "active" // default
    );
    await delay(500);

    console.log("👥 Adding joinedAt attribute...");
    await databases.createDatetimeAttribute(
      config.databaseId,
      config.collections.workspaceMembers,
      "joinedAt",
      true, // required
      null, // no default for required field
      false // not array
    );
    await delay(500);

    console.log("👥 Adding invitedBy attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceMembers,
      "invitedBy",
      50,
      false // optional
    );
    await delay(500);

    console.log("👥 Adding indexes...");
    // Create indexes
    await databases.createIndex(
      config.databaseId,
      config.collections.workspaceMembers,
      "workspace_id_index",
      "key",
      ["workspaceId"]
    );
    await delay(500);

    await databases.createIndex(
      config.databaseId,
      config.collections.workspaceMembers,
      "user_id_index",
      "key",
      ["userId"]
    );
    await delay(500);

    await databases.createIndex(
      config.databaseId,
      config.collections.workspaceMembers,
      "workspace_user_unique",
      "unique",
      ["workspaceId", "userId"]
    );
    await delay(500);

    console.log("✅ Workspace Members collection created successfully");
  } catch (error) {
    console.error(
      "❌ Failed to create Workspace Members collection:",
      error.message
    );
    throw error;
  }
}

async function createWorkspaceInvitesCollection() {
  console.log("\n📨 Creating Workspace Invites collection...");

  try {
    // Create collection
    await databases.createCollection(
      config.databaseId,
      config.collections.workspaceInvites,
      "Workspace Invites",
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      true, // documentSecurity
      true // enabled
    );
    await delay(1000);

    console.log("📨 Adding workspaceId attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "workspaceId",
      50,
      true // required
    );
    await delay(500);

    console.log("📨 Adding workspaceName attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "workspaceName",
      255,
      true // required
    );
    await delay(500);

    console.log("📨 Adding email attribute...");
    await databases.createEmailAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "email",
      true // required
    );
    await delay(500);

    console.log("📨 Adding role attribute...");
    await databases.createEnumAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "role",
      ["admin", "member", "viewer"],
      true, // required
      null // no default for required field
    );
    await delay(500);

    console.log("📨 Adding status attribute...");
    await databases.createEnumAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "status",
      ["pending", "accepted", "cancelled", "expired"],
      false, // optional
      "pending" // default
    );
    await delay(500);

    console.log("📨 Adding invitedBy attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "invitedBy",
      50,
      true // required
    );
    await delay(500);

    console.log("📨 Adding invitedByName attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "invitedByName",
      255,
      true // required
    );
    await delay(500);

    console.log("📨 Adding invitedByEmail attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "invitedByEmail",
      255,
      true // required
    );
    await delay(500);

    console.log("📨 Adding token attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "token",
      255,
      true // required - unique invite token
    );
    await delay(500);

    console.log("📨 Adding date attributes...");
    await databases.createDatetimeAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "expiresAt",
      true, // required
      null, // no default for required field
      false // not array
    );
    await delay(500);

    await databases.createDatetimeAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "respondedAt",
      false, // optional
      null, // no default
      false // not array
    );
    await delay(500);

    console.log("📨 Adding indexes...");
    // Create indexes
    await databases.createIndex(
      config.databaseId,
      config.collections.workspaceInvites,
      "workspace_id_index",
      "key",
      ["workspaceId"]
    );
    await delay(500);

    await databases.createIndex(
      config.databaseId,
      config.collections.workspaceInvites,
      "email_index",
      "key",
      ["email"]
    );
    await delay(500);

    await databases.createIndex(
      config.databaseId,
      config.collections.workspaceInvites,
      "token_unique",
      "unique",
      ["token"]
    );
    await delay(500);

    console.log("✅ Workspace Invites collection created successfully");
  } catch (error) {
    console.error(
      "❌ Failed to create Workspace Invites collection:",
      error.message
    );
    throw error;
  }
}

// Run the setup
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
