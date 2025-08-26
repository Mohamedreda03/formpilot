#!/usr/bin/env node

/**
 * Simple Database Setup Script for FormPilot SaaS
 * Creates only the essential collections and attributes
 */

const { Client, Databases, ID, Permission, Role } = require("node-appwrite");
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

async function deleteAndCreateForms() {
  console.log("🚀 Starting simple database setup...\n");

  try {
    // Delete existing forms collection
    try {
      await databases.deleteCollection(
        config.databaseId,
        config.collections.forms
      );
      console.log("✅ Deleted existing forms collection");
      await delay(2000); // Wait for deletion to complete
    } catch (error) {
      if (error.code === 404) {
        console.log("⚠️  Forms collection not found (skipping deletion)");
      } else {
        console.log("❌ Error deleting forms collection:", error.message);
      }
    }

    // Create forms collection
    console.log("\n📝 Creating Forms collection...");
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

    // Essential attributes only
    console.log("📝 Adding title attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "title",
      255,
      true // required
    );
    await delay(1000);

    console.log("📝 Adding description attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "description",
      1000,
      false // optional
    );
    await delay(1000);

    console.log("📝 Adding questions attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "questions",
      65535, // Large text for JSON
      false // optional
    );
    await delay(1000);

    console.log("📝 Adding introTitle attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "introTitle",
      255,
      false // optional
    );
    await delay(1000);

    console.log("📝 Adding introDescription attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "introDescription",
      1000,
      false // optional
    );
    await delay(1000);

    console.log("📝 Adding introButtonText attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "introButtonText",
      100,
      false // optional
    );
    await delay(1000);

    console.log("📝 Adding outroTitle attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "outroTitle",
      255,
      false // optional
    );
    await delay(1000);

    console.log("📝 Adding outroDescription attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "outroDescription",
      1000,
      false // optional
    );
    await delay(1000);

    console.log("📝 Adding outroButtonText attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "outroButtonText",
      100,
      false // optional
    );
    await delay(1000);

    console.log("📝 Adding userId attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "userId",
      50,
      true // required
    );
    await delay(1000);

    console.log("📝 Adding workspaceId attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "workspaceId",
      50,
      false // optional
    );
    await delay(1000);

    console.log("📝 Adding isPublic attribute...");
    await databases.createBooleanAttribute(
      config.databaseId,
      config.collections.forms,
      "isPublic",
      false, // optional
      false // default
    );
    await delay(1000);

    console.log("📝 Adding isActive attribute...");
    await databases.createBooleanAttribute(
      config.databaseId,
      config.collections.forms,
      "isActive",
      false, // optional
      true // default
    );
    await delay(1000);

    console.log("📝 Adding submissionCount attribute...");
    await databases.createIntegerAttribute(
      config.databaseId,
      config.collections.forms,
      "submissionCount",
      false, // optional
      0, // min
      null, // max
      0 // default
    );
    await delay(1000);

    console.log("📝 Adding slug attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "slug",
      255,
      false // optional
    );
    await delay(1000);

    console.log("📝 Adding settings attribute...");
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "settings",
      5000, // JSON for form settings
      false // optional
    );
    await delay(1000);

    console.log("✅ Forms collection created successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Test creating a new form");
    console.log("2. Verify the form loads correctly");
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  deleteAndCreateForms();
}

module.exports = { deleteAndCreateForms };
