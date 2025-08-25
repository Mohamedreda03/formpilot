const { Client, Databases, Account, Query, ID } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const config = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  collections: {
    workspaceMembers:
      process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_MEMBERS_COLLECTION_ID,
    workspaces: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_COLLECTION_ID,
  },
};

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const account = new Account(client);

async function addUserToDefaultWorkspace() {
  console.log("🔄 Adding current user to default workspace...");

  try {
    // Get current user session (you'll need to update this with actual user ID)
    // For now, I'll use a placeholder - you should replace this with actual user ID
    const userId = "user123"; // Replace with actual user ID
    const userEmail = "user@example.com"; // Replace with actual user email
    const userName = "Test User"; // Replace with actual user name

    // Get first workspace
    const workspacesResult = await databases.listDocuments(
      config.databaseId,
      config.collections.workspaces,
      [Query.limit(1)]
    );

    if (workspacesResult.documents.length === 0) {
      console.log("❌ No workspaces found. Please create a workspace first.");
      return;
    }

    const workspace = workspacesResult.documents[0];
    console.log(`📂 Found workspace: ${workspace.name} (${workspace.$id})`);

    // Check if user is already a member
    const existingMember = await databases.listDocuments(
      config.databaseId,
      config.collections.workspaceMembers,
      [Query.equal("workspaceId", workspace.$id), Query.equal("userId", userId)]
    );

    if (existingMember.documents.length > 0) {
      console.log("✅ User is already a member of this workspace");
      return;
    }

    // Add user as owner of the workspace
    await databases.createDocument(
      config.databaseId,
      config.collections.workspaceMembers,
      ID.unique(),
      {
        workspaceId: workspace.$id,
        userId: userId,
        userEmail: userEmail,
        userName: userName,
        userAvatar: null,
        role: "owner",
        status: "active",
        joinedAt: new Date().toISOString(),
        invitedBy: null,
      }
    );

    console.log("✅ User added to workspace as owner successfully!");
    console.log(`📋 Workspace: ${workspace.name}`);
    console.log(`👤 User: ${userName} (${userEmail})`);
    console.log(`🔑 Role: owner`);
  } catch (error) {
    console.error("❌ Error adding user to workspace:", error);
    throw error;
  }
}

// Instructions for manual setup
console.log(`
📝 SETUP INSTRUCTIONS:
1. Open your browser and go to your FormPilot app
2. Login with your account
3. Open Developer Tools (F12)
4. Go to Console tab
5. Run this command to get your user info:
   
   localStorage.getItem('cookieFallback')
   
6. Copy the user ID from the session data
7. Update this script with your actual user ID, email, and name
8. Run the script again

OR

Run this in your browser console after logging in:
const user = JSON.parse(localStorage.getItem('cookieFallback') || '{}');
console.log('User ID:', user.userId);
console.log('User Email:', user.email);
console.log('User Name:', user.name);
`);

// Run the script (commented out until user provides real data)
// if (require.main === module) {
//   addUserToDefaultWorkspace();
// }

module.exports = { addUserToDefaultWorkspace };
