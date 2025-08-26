import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Client, Databases, ID, Query } from "node-appwrite";

// Appwrite client setup
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail", // or another email service of your choice
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASSWORD!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const {
      workspaceId,
      email,
      role,
      invitedBy,
      invitedByName,
      workspaceName,
    } = await request.json();

    if (!workspaceId || !email || !role || !invitedBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique invite token
    const inviteToken = `${workspaceId}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Set expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Check if user is already invited or a member
    const existingInvite = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_INVITES_COLLECTION_ID!,
      [
        Query.equal("workspaceId", workspaceId),
        Query.equal("email", email),
        Query.equal("status", "pending"),
      ]
    );

    if (existingInvite.documents.length > 0) {
      return NextResponse.json(
        { error: "User already has a pending invitation" },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const existingMember = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_MEMBERS_COLLECTION_ID!,
      [
        Query.equal("workspaceId", workspaceId),
        Query.equal("userEmail", email),
        Query.equal("status", "active"),
      ]
    );

    if (existingMember.documents.length > 0) {
      return NextResponse.json(
        { error: "User is already a member of this workspace" },
        { status: 400 }
      );
    }

    // Create invite in database
    const invite = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_INVITES_COLLECTION_ID!,
      ID.unique(),
      {
        workspaceId,
        workspaceName: workspaceName || "Workspace",
        email,
        role,
        status: "pending",
        invitedBy,
        invitedByName: invitedByName || "Someone",
        invitedByEmail: "", // can be added later
        token: inviteToken,
        expiresAt: expiresAt.toISOString(),
        respondedAt: null,
      }
    );

    // Create invite URL
    const inviteUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/invite?token=${inviteToken}`;

    // Email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Workspace Invitation</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f8f9fa;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .content {
              padding: 30px;
            }
            .btn {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .role-badge {
              display: inline-block;
              padding: 4px 12px;
              background: #e3f2fd;
              color: #1976d2;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 You're Invited!</h1>
              <p>Join ${workspaceName} workspace</p>
            </div>
            
            <div class="content">
              <p>Hello,</p>
              
              <p><strong>${invitedByName}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace as a <span class="role-badge">${role}</span>.</p>
              
              <p>Click the button below to accept the invitation and get started:</p>
              
              <div style="text-align: center;">
                <a href="${inviteUrl}" class="btn">Accept Invitation</a>
              </div>
              
              <p><small>Or copy and paste this link in your browser:<br>
              <a href="${inviteUrl}">${inviteUrl}</a></small></p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              
              <p><strong>What happens next?</strong></p>
              <ul>
                <li>Create your account or log in if you already have one</li>
                <li>Get access to the workspace with ${role} permissions</li>
                <li>Start collaborating with your team</li>
              </ul>
              
              <p><small><strong>Note:</strong> This invitation will expire in 7 days.</small></p>
            </div>
            
            <div class="footer">
              <p>This invitation was sent by ${invitedByName} via FormPilot.</p>
              <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    const mailOptions = {
      from: `"FormPilot" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Invitation to join ${workspaceName} workspace`,
      html: emailHtml,
      text: `
        You've been invited to join ${workspaceName} workspace!
        
        ${invitedByName} has invited you to join as a ${role}.
        
        Click this link to accept: ${inviteUrl}
        
        This invitation expires in 7 days.
      `.trim(),
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
      invite: {
        id: invite.$id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error sending invite:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
