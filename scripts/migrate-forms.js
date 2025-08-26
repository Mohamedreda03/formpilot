require("dotenv").config({ path: ".env.local" });
const { Client, Databases, ID, Permission, Role } = require("node-appwrite");

const config = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  collections: {
    forms: process.env.NEXT_PUBLIC_APPWRITE_FORMS_COLLECTION_ID,
  },
};

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function migrateFormsCollection() {
  console.log("🔄 Migrating Forms collection...");

  try {
    // Try to delete the old collection
    try {
      await databases.deleteCollection(
        config.databaseId,
        config.collections.forms
      );
      console.log("📝 Deleted old Forms collection");

      // Wait a moment for deletion to complete
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.log(
        "ℹ️ Collection doesn't exist or couldn't be deleted, continuing..."
      );
    }

    // Create new collection
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

    console.log("📝 Created new Forms collection");

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

    // Questions stored as JSON
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "questions",
      65535, // Large text for JSON
      false // optional - can have forms without questions initially
    );

    // Intro page data
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "introTitle",
      255,
      false // optional
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "introDescription",
      1000,
      false // optional
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "introButtonText",
      100,
      false // optional
    );

    // Outro page data
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "outroTitle",
      255,
      false // optional
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "outroDescription",
      1000,
      false // optional
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "outroButtonText",
      100,
      false // optional
    );

    // Settings and metadata
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "settings",
      5000, // JSON for form settings
      false // optional
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

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.forms,
      "slug",
      100,
      false // optional
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

    console.log("✅ Forms collection migration completed successfully!");
  } catch (error) {
    console.error("❌ Error migrating Forms collection:", error);
    throw error;
  }
}

async function main() {
  try {
    console.log("🚀 Starting Forms collection migration...");
    await migrateFormsCollection();
    console.log("🎉 Migration completed!");
  } catch (error) {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  }
}

main();
