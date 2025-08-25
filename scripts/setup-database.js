#!/usr/bin/env node

/**
 * Appwrite Database Setup Script
 * This script creates the database, collections, and attributes for FormPilot SaaS
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
    users: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
    forms: process.env.NEXT_PUBLIC_APPWRITE_FORMS_COLLECTION_ID,
    submissions: process.env.NEXT_PUBLIC_APPWRITE_SUBMISSIONS_COLLECTION_ID,
    templates: process.env.NEXT_PUBLIC_APPWRITE_TEMPLATES_COLLECTION_ID,
    workspaces: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_COLLECTION_ID,
    teams: process.env.NEXT_PUBLIC_APPWRITE_TEAMS_COLLECTION_ID,
  },
};

// Initialize Appwrite
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);

async function setupDatabase() {
  try {
    console.log("🚀 Starting FormPilot SaaS database setup...\n");

    // Step 1: Create Database
    await createDatabase();

    // Step 2: Create Collections
    await createUsersCollection();
    await createFormsCollection();
    await createSubmissionsCollection();
    await createTemplatesCollection();
    await createWorkspacesCollection();
    await createTeamsCollection();

    console.log("✅ Database setup completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Update your APPWRITE_API_KEY in .env.local");
    console.log("2. Verify collections in Appwrite Console");
    console.log("3. Configure permissions as needed");
    console.log("4. Set up Google OAuth in Appwrite Console\n");
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

async function createUsersCollection() {
  console.log("\n👥 Creating Users collection...");

  try {
    // Create collection
    await databases.createCollection(
      config.databaseId,
      config.collections.users,
      "Users",
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      true, // documentSecurity
      true // enabled
    );

    // Create attributes
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.users,
      "name",
      255,
      true // required
    );

    await databases.createEmailAttribute(
      config.databaseId,
      config.collections.users,
      "email",
      true // required
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.users,
      "avatar",
      500,
      false // optional
    );

    await databases.createEnumAttribute(
      config.databaseId,
      config.collections.users,
      "subscription",
      ["free", "pro", "enterprise"],
      false, // required
      "free", // default
      false // array
    );

    await databases.createIntegerAttribute(
      config.databaseId,
      config.collections.users,
      "credits",
      false, // optional
      0, // min
      null, // max
      10, // default
      false, // array
      false
    );

    await databases.createDatetimeAttribute(
      config.databaseId,
      config.collections.users,
      "createdAt",
      true // required
    );

    await databases.createDatetimeAttribute(
      config.databaseId,
      config.collections.users,
      "updatedAt",
      true // required
    );

    // Create indexes
    await databases.createIndex(
      config.databaseId,
      config.collections.users,
      "email_index",
      "unique",
      ["email"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.users,
      "subscription_index",
      "key",
      ["subscription"]
    );

    console.log("✅ Users collection created successfully");
  } catch (error) {
    if (error.code === 409) {
      console.log("👥 Users collection already exists, skipping...");
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

    // Create attributes
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "title",
      255,
      true // required
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "description",
      1000,
      false // optional
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "fields",
      65535, // Large text for JSON
      true // required
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "userId",
      50,
      true // required
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "workspaceId",
      50,
      false // optional - forms can exist without workspace
    );

    await databases.createBooleanAttribute(
      config.databaseId,
      config.collections.forms,
      "isPublic",
      false, // optional
      false, // default
      false // array
    );

    await databases.createBooleanAttribute(
      config.databaseId,
      config.collections.forms,
      "isActive",
      false, // optional
      true, // default
      false // array
    );

    await databases.createIntegerAttribute(
      config.databaseId,
      config.collections.forms,
      "submissionCount",
      false, // optional
      0, // min
      null, // max
      0, // default
      false, // array
      false
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "slug",
      255,
      false // optional
    );

    await databases.createDatetimeAttribute(
      config.databaseId,
      config.collections.forms,
      "createdAt",
      true // required
    );

    await databases.createDatetimeAttribute(
      config.databaseId,
      config.collections.forms,
      "updatedAt",
      true // required
    );

    // Create indexes
    await databases.createIndex(
      config.databaseId,
      config.collections.forms,
      "userId_index",
      "key",
      ["userId"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.forms,
      "workspaceId_index",
      "key",
      ["workspaceId"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.forms,
      "public_forms_index",
      "key",
      ["isPublic", "isActive"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.forms,
      "slug_index",
      "unique",
      ["slug"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.forms,
      "created_date_index",
      "key",
      ["createdAt"]
    );

    console.log("✅ Forms collection created successfully");
  } catch (error) {
    if (error.code === 409) {
      console.log("📝 Forms collection already exists, skipping...");
    } else {
      throw error;
    }
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

    // Create attributes
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.submissions,
      "formId",
      50,
      true // required
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.submissions,
      "responses",
      65535, // Large text for JSON
      true // required
    );

    await databases.createEmailAttribute(
      config.databaseId,
      config.collections.submissions,
      "submitterEmail",
      false // optional
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.submissions,
      "submitterName",
      255,
      false // optional
    );

    await databases.createIpAttribute(
      config.databaseId,
      config.collections.submissions,
      "submitterIp",
      false // optional
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.submissions,
      "userAgent",
      500,
      false // optional
    );

    await databases.createDatetimeAttribute(
      config.databaseId,
      config.collections.submissions,
      "submittedAt",
      true // required
    );

    // Create indexes
    await databases.createIndex(
      config.databaseId,
      config.collections.submissions,
      "formId_index",
      "key",
      ["formId"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.submissions,
      "submitted_date_index",
      "key",
      ["submittedAt"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.submissions,
      "submitter_email_index",
      "key",
      ["submitterEmail"]
    );

    console.log("✅ Submissions collection created successfully");
  } catch (error) {
    if (error.code === 409) {
      console.log("📊 Submissions collection already exists, skipping...");
    } else {
      throw error;
    }
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

    // Create attributes
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.templates,
      "name",
      255,
      true // required
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.templates,
      "description",
      1000,
      false // optional
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.templates,
      "category",
      100,
      true // required
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.templates,
      "fields",
      65535, // Large text for JSON
      true // required
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.templates,
      "previewImage",
      500,
      false // optional
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.templates,
      "tags",
      1000,
      false // optional - comma separated
    );

    await databases.createEnumAttribute(
      config.databaseId,
      config.collections.templates,
      "difficulty",
      ["beginner", "intermediate", "advanced"],
      false, // optional
      "beginner", // default
      false // array
    );

    await databases.createIntegerAttribute(
      config.databaseId,
      config.collections.templates,
      "usageCount",
      false, // optional
      0, // min
      null, // max
      0, // default
      false, // array
      false
    );

    await databases.createDatetimeAttribute(
      config.databaseId,
      config.collections.templates,
      "createdAt",
      true // required
    );

    await databases.createDatetimeAttribute(
      config.databaseId,
      config.collections.templates,
      "updatedAt",
      true // required
    );

    // Create indexes
    await databases.createIndex(
      config.databaseId,
      config.collections.templates,
      "category_index",
      "key",
      ["category"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.templates,
      "difficulty_index",
      "key",
      ["difficulty"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.templates,
      "usage_count_index",
      "key",
      ["usageCount"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.templates,
      "name_search_index",
      "fulltext",
      ["name", "description"]
    );

    console.log("✅ Templates collection created successfully");
  } catch (error) {
    if (error.code === 409) {
      console.log("🎨 Templates collection already exists, skipping...");
    } else {
      throw error;
    }
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

    // Create attributes
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaces,
      "name",
      255,
      true // required
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaces,
      "description",
      1000,
      false // optional
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaces,
      "ownerId",
      50,
      true // required - مالك المشروع
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaces,
      "color",
      20,
      false // optional
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaces,
      "icon",
      50,
      false // optional
    );

    await databases.createBooleanAttribute(
      config.databaseId,
      config.collections.workspaces,
      "isActive",
      false, // optional
      true, // default
      false // array
    );

    await databases.createIntegerAttribute(
      config.databaseId,
      config.collections.workspaces,
      "formsCount",
      false, // optional
      0, // min
      null, // max
      0 // default
    );

    await databases.createIntegerAttribute(
      config.databaseId,
      config.collections.workspaces,
      "membersCount",
      false, // optional
      0, // min
      null, // max
      1 // default (owner)
    );

    await databases.createDatetimeAttribute(
      config.databaseId,
      config.collections.workspaces,
      "createdAt",
      true // required
    );

    await databases.createDatetimeAttribute(
      config.databaseId,
      config.collections.workspaces,
      "updatedAt",
      true // required
    );

    // Create indexes
    await databases.createIndex(
      config.databaseId,
      config.collections.workspaces,
      "ownerId_index",
      "key",
      ["ownerId"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.workspaces,
      "active_workflows_index",
      "key",
      ["isActive"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.workspaces,
      "created_date_index",
      "key",
      ["createdAt"]
    );

    console.log("✅ Workspaces collection created successfully");
  } catch (error) {
    if (error.code === 409) {
      console.log("🔄 Workspaces collection already exists, skipping...");
    } else {
      throw error;
    }
  }
}

async function createTeamsCollection() {
  console.log("\n👥 Creating Teams collection...");

  try {
    // Create collection
    await databases.createCollection(
      config.databaseId,
      config.collections.teams,
      "Teams",
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      true, // documentSecurity
      true // enabled
    );

    // Create attributes
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.teams,
      "workflowId",
      50,
      true // required
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.teams,
      "userId",
      50,
      true // required
    );

    await databases.createEnumAttribute(
      config.databaseId,
      config.collections.teams,
      "role",
      ["owner", "admin", "editor", "viewer"],
      false, // optional
      "viewer", // default
      false // array
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.teams,
      "invitedBy",
      50,
      false // optional - who invited this member
    );

    await databases.createEnumAttribute(
      config.databaseId,
      config.collections.teams,
      "status",
      ["active", "pending", "inactive"],
      false, // optional
      "pending", // default
      false // array
    );

    await databases.createDatetimeAttribute(
      config.databaseId,
      config.collections.teams,
      "joinedAt",
      true // required
    );

    await databases.createDatetimeAttribute(
      config.databaseId,
      config.collections.teams,
      "invitedAt",
      false // optional
    );

    // Create indexes
    await databases.createIndex(
      config.databaseId,
      config.collections.teams,
      "workflowId_index",
      "key",
      ["workflowId"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.teams,
      "userId_index",
      "key",
      ["userId"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.teams,
      "workflow_user_unique",
      "unique",
      ["workflowId", "userId"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.teams,
      "role_index",
      "key",
      ["role"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.teams,
      "status_index",
      "key",
      ["status"]
    );

    console.log("✅ Teams collection created successfully");
  } catch (error) {
    if (error.code === 409) {
      console.log("👥 Teams collection already exists, skipping...");
    } else {
      throw error;
    }
  }
}

// Run the setup
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
