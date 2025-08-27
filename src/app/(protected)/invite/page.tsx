"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, UserPlus, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { databases } from "@/lib/appwrite-config";
import { Query, ID } from "appwrite";
import { toast } from "sonner";

interface InviteData {
  $id: string;
  workspaceId: string;
  workspaceName: string;
  email: string;
  role: string;
  status: string;
  invitedBy: string;
  invitedByName: string;
  expiresAt: string;
  token: string;
}

export default function InvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, login } = useAuth();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");

  // Fetch invite data
  useEffect(() => {
    const fetchInvite = async () => {
      if (!token) {
        setError("Invalid invitation link");
        setLoading(false);
        return;
      }

      try {
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_INVITES_COLLECTION_ID!,
          [Query.equal("token", token)]
        );

        if (response.documents.length === 0) {
          setError("Invitation not found");
          setLoading(false);
          return;
        }

        const inviteData = response.documents[0] as unknown as InviteData;

        // Check if invite is expired
        if (new Date(inviteData.expiresAt) < new Date()) {
          setError("This invitation has expired");
          setLoading(false);
          return;
        }

        // Check if invite is already used
        if (inviteData.status !== "pending") {
          setError("This invitation has already been used");
          setLoading(false);
          return;
        }

        setInvite(inviteData);
      } catch (error) {
        console.error("Error fetching invite:", error);
        setError("Failed to load invitation");
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [token]);

  // Auto-accept if user is already logged in
  useEffect(() => {
    if (user && invite && !processing) {
      handleAcceptInvite();
    }
  }, [user, invite]);

  const handleAcceptInvite = async () => {
    if (!invite || !user) return;

    setProcessing(true);
    try {
      // Check if user email matches invite email
      if (user.email !== invite.email) {
        setError(
          `This invitation is for ${invite.email}. Please log in with the correct account.`
        );
        setProcessing(false);
        return;
      }

      // Check if user is already a member
      const existingMember = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_MEMBERS_COLLECTION_ID!,
        [
          Query.equal("workspaceId", invite.workspaceId),
          Query.equal("userId", user.$id),
          Query.equal("status", "active"),
        ]
      );

      if (existingMember.documents.length > 0) {
        setError("You are already a member of this workspace");
        setProcessing(false);
        return;
      }

      // Add user to workspace
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_MEMBERS_COLLECTION_ID!,
        ID.unique(),
        {
          workspaceId: invite.workspaceId,
          userId: user.$id,
          userEmail: user.email,
          userName: user.name,
          userAvatar: null,
          role: invite.role,
          status: "active",
          joinedAt: new Date().toISOString(),
          invitedBy: invite.invitedBy,
        }
      );

      // Update invite status
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_WORKSPACE_INVITES_COLLECTION_ID!,
        invite.$id,
        {
          status: "accepted",
          respondedAt: new Date().toISOString(),
        }
      );

      setSuccess(true);
      toast.success("Welcome to the workspace!");

      // Redirect to workspace after a delay
      setTimeout(() => {
        router.push(`/ws/${invite.workspaceId}`);
      }, 2000);
    } catch (error) {
      console.error("Error accepting invite:", error);
      setError("Failed to accept invitation. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleLogin = () => {
    // Redirect to login page with return URL
    const returnUrl = encodeURIComponent(`/invite?token=${token}`);
    router.push(`/login?redirect=${returnUrl}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Invitation Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push("/")} variant="outline">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-600">Welcome!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              You've successfully joined{" "}
              <strong>{invite?.workspaceName}</strong>!
            </p>
            <p className="text-sm text-gray-500">Redirecting to workspace...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <UserPlus className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <CardTitle>Join Workspace</CardTitle>
          </CardHeader>
          <CardContent>
            {invite && (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    You've been invited to join{" "}
                    <strong>{invite.workspaceName}</strong> as a{" "}
                    <strong>{invite.role}</strong> by{" "}
                    <strong>{invite.invitedByName}</strong>.
                  </AlertDescription>
                </Alert>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Invitation Details:</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <strong>Workspace:</strong> {invite.workspaceName}
                    </p>
                    <p>
                      <strong>Role:</strong> {invite.role}
                    </p>
                    <p>
                      <strong>Invited by:</strong> {invite.invitedByName}
                    </p>
                    <p>
                      <strong>Email:</strong> {invite.email}
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <strong>Expires:</strong>{" "}
                      {new Date(invite.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button onClick={handleLogin} className="w-full">
                    Login to Accept Invitation
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    Don't have an account? You can create one after clicking
                    login.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Accepting invitation...</p>
        </div>
      </div>
    );
  }

  return null;
}
