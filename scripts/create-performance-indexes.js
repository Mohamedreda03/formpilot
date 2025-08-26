#!/usr/bin/env node

/**
 * Performance Optimization Script for FormPilot SaaS
 * This script creates additional indexes for better query performance
 *
 * Run this script with: node scripts/create-performance-indexes.js
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
    workspaces: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_COLLECTION_ID,
    workspaceMembers:
      process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_MEMBERS_COLLECTION_ID,
  },
};

// Initialize Appwrite
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);

async function createPerformanceIndexes() {
  try {
    console.log("🚀 Creating performance optimization indexes...\n");

    // Forms collection performance indexes
    await createFormsPerformanceIndexes();

    // Workspaces collection performance indexes
    await createWorkspacesPerformanceIndexes();

    // Workspace Members collection performance indexes
    await createWorkspaceMembersPerformanceIndexes();

    console.log("✅ Performance indexes created successfully!");
    console.log(
      "\n📈 Your application should now have significantly better query performance!"
    );
  } catch (error) {
    console.error("❌ Performance optimization failed:", error.message);
    process.exit(1);
  }
}

async function createFormsPerformanceIndexes() {
  console.log("📝 Creating Forms performance indexes...");

  try {
    // Compound index for workspace + creation date sorting (most common query)
    await databases.createIndex(
      config.databaseId,
      config.collections.forms,
      "workspace_created_desc_perf",
      "key",
      ["workspaceId", "$createdAt"]
    );
    console.log("✅ workspace_created_desc_perf index created");

    // Compound index for workspace + update date sorting
    await databases.createIndex(
      config.databaseId,
      config.collections.forms,
      "workspace_updated_desc_perf",
      "key",
      ["workspaceId", "$updatedAt"]
    );
    console.log("✅ workspace_updated_desc_perf index created");

    // Compound index for workspace + title alphabetical sorting
    await databases.createIndex(
      config.databaseId,
      config.collections.forms,
      "workspace_title_asc_perf",
      "key",
      ["workspaceId", "title"]
    );
    console.log("✅ workspace_title_asc_perf index created");

    // Index for active forms in workspace
    await databases.createIndex(
      config.databaseId,
      config.collections.forms,
      "workspace_active_forms_perf",
      "key",
      ["workspaceId", "isActive"]
    );
    console.log("✅ workspace_active_forms_perf index created");
  } catch (error) {
    if (error.code === 409) {
      console.log("📝 Some Forms indexes already exist, skipping...");
    } else {
      throw error;
    }
  }
}

async function createWorkspacesPerformanceIndexes() {
  console.log("\n🔄 Creating Workspaces performance indexes...");

  try {
    // Compound index for owner + creation date (for getting user's workspaces)
    await databases.createIndex(
      config.databaseId,
      config.collections.workspaces,
      "owner_created_desc_perf",
      "key",
      ["ownerId", "$createdAt"]
    );
    console.log("✅ owner_created_desc_perf index created");

    // Index for active workspaces by owner
    await databases.createIndex(
      config.databaseId,
      config.collections.workspaces,
      "owner_active_workspaces_perf",
      "key",
      ["ownerId", "isActive"]
    );
    console.log("✅ owner_active_workspaces_perf index created");
  } catch (error) {
    if (error.code === 409) {
      console.log("🔄 Some Workspaces indexes already exist, skipping...");
    } else {
      throw error;
    }
  }
}

async function createWorkspaceMembersPerformanceIndexes() {
  console.log("\n👥 Creating Workspace Members performance indexes...");

  try {
    // Compound index for user + status + joined date (for getting user's memberships)
    await databases.createIndex(
      config.databaseId,
      config.collections.workspaceMembers,
      "user_status_joined_perf",
      "key",
      ["userId", "status", "joinedAt"]
    );
    console.log("✅ user_status_joined_perf index created");

    // Compound index for workspace + status (for getting workspace members)
    await databases.createIndex(
      config.databaseId,
      config.collections.workspaceMembers,
      "workspace_status_members_perf",
      "key",
      ["workspaceId", "status"]
    );
    console.log("✅ workspace_status_members_perf index created");

    // Compound index for workspace + user (unique constraint + fast lookup)
    await databases.createIndex(
      config.databaseId,
      config.collections.workspaceMembers,
      "workspace_user_unique_perf",
      "unique",
      ["workspaceId", "userId"]
    );
    console.log("✅ workspace_user_unique_perf index created");
  } catch (error) {
    if (error.code === 409) {
      console.log(
        "👥 Some Workspace Members indexes already exist, skipping..."
      );
    } else {
      throw error;
    }
  }
}

// Run the script
createPerformanceIndexes();
