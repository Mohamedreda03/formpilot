const { Client, Databases, Permission, Role, ID } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const config = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  collections: {
    workspaceMembers:
      process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_MEMBERS_COLLECTION_ID,
    workspaceInvites:
      process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_INVITES_COLLECTION_ID,
  },
};

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function recreateTeamCollections() {
  console.log("🔄 Recreating team collections...");

  try {
    // Delete existing collections
    console.log("❌ Deleting existing Workspace Members collection...");
    try {
      await databases.deleteCollection(
        config.databaseId,
        config.collections.workspaceMembers
      );
      console.log("✅ Workspace Members collection deleted");
    } catch (error) {
      if (error.code === 404) {
        console.log(
          "👥 Workspace Members collection not found, skipping delete..."
        );
      } else {
        throw error;
      }
    }

    console.log("❌ Deleting existing Workspace Invites collection...");
    try {
      await databases.deleteCollection(
        config.databaseId,
        config.collections.workspaceInvites
      );
      console.log("✅ Workspace Invites collection deleted");
    } catch (error) {
      if (error.code === 404) {
        console.log(
          "📨 Workspace Invites collection not found, skipping delete..."
        );
      } else {
        throw error;
      }
    }

    // Wait a moment for deletion to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Recreate collections
    await createWorkspaceMembersCollection();
    await createWorkspaceInvitesCollection();

    console.log("✅ Team collections recreated successfully!");
  } catch (error) {
    console.error("❌ Error recreating team collections:", error);
    throw error;
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

    // Create attributes
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceMembers,
      "workspaceId",
      50,
      true // required
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceMembers,
      "userId",
      50,
      true // required
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceMembers,
      "userEmail",
      255,
      true // required
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceMembers,
      "userName",
      255,
      true // required
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceMembers,
      "userAvatar",
      500,
      false // optional
    );

    await databases.createEnumAttribute(
      config.databaseId,
      config.collections.workspaceMembers,
      "role",
      ["owner", "admin", "member", "viewer"],
      true, // required
      null, // no default for required field
      false // array
    );

    await databases.createEnumAttribute(
      config.databaseId,
      config.collections.workspaceMembers,
      "status",
      ["active", "removed"],
      false, // optional
      "active", // default
      false // array
    );

    await databases.createDatetimeAttribute(
      config.databaseId,
      config.collections.workspaceMembers,
      "joinedAt",
      true // required
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceMembers,
      "invitedBy",
      50,
      false // optional
    );

    // Wait for attributes to be created
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Create indexes
    await databases.createIndex(
      config.databaseId,
      config.collections.workspaceMembers,
      "workspace_id_index",
      "key",
      ["workspaceId"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.workspaceMembers,
      "user_id_index",
      "key",
      ["userId"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.workspaceMembers,
      "workspace_user_unique",
      "unique",
      ["workspaceId", "userId"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.workspaceMembers,
      "user_email_index",
      "key",
      ["userEmail"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.workspaceMembers,
      "role_index",
      "key",
      ["role"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.workspaceMembers,
      "status_index",
      "key",
      ["status"]
    );

    console.log("✅ Workspace Members collection created successfully");
  } catch (error) {
    console.error("❌ Error creating Workspace Members collection:", error);
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

    // Create attributes
    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "workspaceId",
      50,
      true // required
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "workspaceName",
      255,
      true // required
    );

    await databases.createEmailAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "email",
      true // required
    );

    await databases.createEnumAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "role",
      ["admin", "member", "viewer"],
      true, // required
      null, // no default for required field
      false // array
    );

    await databases.createEnumAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "status",
      ["pending", "accepted", "cancelled", "expired"],
      false, // optional
      "pending", // default
      false // array
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "invitedBy",
      50,
      true // required
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "invitedByName",
      255,
      true // required
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "invitedByEmail",
      255,
      true // required
    );

    await databases.createStringAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "token",
      255,
      true // required - unique invite token
    );

    await databases.createDatetimeAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "createdAt",
      true // required
    );

    await databases.createDatetimeAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "expiresAt",
      true // required
    );

    await databases.createDatetimeAttribute(
      config.databaseId,
      config.collections.workspaceInvites,
      "respondedAt",
      false // optional
    );

    // Wait for attributes to be created
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Create indexes
    await databases.createIndex(
      config.databaseId,
      config.collections.workspaceInvites,
      "workspace_id_index",
      "key",
      ["workspaceId"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.workspaceInvites,
      "email_index",
      "key",
      ["email"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.workspaceInvites,
      "token_unique",
      "unique",
      ["token"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.workspaceInvites,
      "status_index",
      "key",
      ["status"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.workspaceInvites,
      "invited_by_index",
      "key",
      ["invitedBy"]
    );

    await databases.createIndex(
      config.databaseId,
      config.collections.workspaceInvites,
      "expires_at_index",
      "key",
      ["expiresAt"]
    );

    console.log("✅ Workspace Invites collection created successfully");
  } catch (error) {
    console.error("❌ Error creating Workspace Invites collection:", error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  recreateTeamCollections();
}

module.exports = { recreateTeamCollections };
