#!/usr/bin/env node

/**
 * Diagnostic script to check Appwrite connection and permissions
 */

const { Client, Databases, Account, Teams } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

// Configuration
const config = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  apiKey: process.env.APPWRITE_API_KEY,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
};

// Initialize Appwrite
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);
const account = new Account(client);
const teams = new Teams(client);

async function diagnoseConnection() {
  console.log("🔍 Starting Appwrite connection diagnosis...\n");

  // Check configuration
  console.log("📋 Configuration:");
  console.log(`   Endpoint: ${config.endpoint}`);
  console.log(`   Project ID: ${config.projectId}`);
  console.log(`   Database ID: ${config.databaseId}`);
  console.log(`   API Key: ${config.apiKey ? "Set ✅" : "Missing ❌"}\n`);

  try {
    // Test 1: Check API Key validity by getting teams
    console.log("1️⃣ Testing API Key validity...");
    try {
      const teamsList = await teams.list();
      console.log("   ✅ API Key is valid");
      console.log(`   📊 Teams count: ${teamsList.total}\n`);
    } catch (error) {
      console.log("   ❌ API Key test failed:");
      console.log(`   Error: ${error.message}\n`);
      return;
    }

    // Test 2: Check if database exists
    console.log("2️⃣ Testing database access...");
    try {
      const database = await databases.get(config.databaseId);
      console.log("   ✅ Database exists and accessible");
      console.log(`   📋 Database name: ${database.name}`);
      console.log(`   🔧 Database enabled: ${database.enabled}\n`);
    } catch (error) {
      if (error.code === 404) {
        console.log("   ⚠️  Database not found. Attempting to create it...");
        try {
          await databases.create(
            config.databaseId,
            "FormPilot Database",
            true // enabled
          );
          console.log("   ✅ Database created successfully\n");
        } catch (createError) {
          console.log("   ❌ Failed to create database:");
          console.log(`   Error: ${createError.message}\n`);
          return;
        }
      } else {
        console.log("   ❌ Database access failed:");
        console.log(`   Error: ${error.message}\n`);
        return;
      }
    }

    // Test 3: List existing collections
    console.log("3️⃣ Listing existing collections...");
    try {
      const collections = await databases.listCollections(config.databaseId);
      console.log(`   📊 Collections found: ${collections.total}`);

      if (collections.total > 0) {
        const collectionsList =
          collections.collections || collections.documents || [];
        if (collectionsList.length > 0) {
          console.log("   📋 Existing collections:");
          collectionsList.forEach((collection, index) => {
            console.log(
              `      ${index + 1}. ${collection.name} (ID: ${collection.$id})`
            );
            console.log(
              `         - Attributes: ${collection.attributes?.length || 0}`
            );
            console.log(
              `         - Indexes: ${collection.indexes?.length || 0}`
            );
            console.log(
              `         - Enabled: ${collection.enabled ? "✅" : "❌"}`
            );
          });
        }
      } else {
        console.log("   📭 No collections found in database");
      }
      console.log("");
    } catch (error) {
      console.log("   ❌ Failed to list collections:");
      console.log(`   Error: ${error.message}\n`);
    }

    // Test 4: Test creating a simple collection
    console.log("4️⃣ Testing collection creation...");
    const testCollectionId = "test-collection-" + Date.now();
    try {
      await databases.createCollection(
        config.databaseId,
        testCollectionId,
        "Test Collection",
        [],
        false,
        true
      );
      console.log("   ✅ Test collection created successfully");

      // Clean up test collection
      await databases.deleteCollection(config.databaseId, testCollectionId);
      console.log("   🧹 Test collection cleaned up\n");
    } catch (error) {
      console.log("   ❌ Failed to create test collection:");
      console.log(`   Error: ${error.message}\n`);
    }

    console.log("✅ Diagnosis completed successfully!");
    console.log("🚀 Your Appwrite setup appears to be working correctly.");
  } catch (error) {
    console.error("❌ Diagnosis failed:", error.message);
    console.error("\n🔧 Possible solutions:");
    console.error("1. Check your API key permissions");
    console.error("2. Verify project ID is correct");
    console.error("3. Ensure endpoint URL is correct");
    console.error("4. Check internet connection");
    process.exit(1);
  }
}

// Run the diagnosis
if (require.main === module) {
  diagnoseConnection();
}

module.exports = { diagnoseConnection };
