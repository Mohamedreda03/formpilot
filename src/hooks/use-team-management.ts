import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workspaceMemberDB, workspaceInviteDB } from "@/lib/database";
import { Models } from "appwrite";

// Types
export interface WorkspaceMember extends Models.Document {
  workspaceId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  role: "owner" | "admin" | "member" | "viewer";
  joinedAt: string;
  invitedBy?: string;
  status: "active" | "pending" | "removed";
}

export interface WorkspaceInvite extends Models.Document {
  workspaceId: string;
  workspaceName?: string;
  email: string;
  role: "admin" | "member" | "viewer";
  status: "pending" | "accepted" | "expired" | "cancelled";
  invitedBy: string;
  invitedByName?: string;
  invitedByEmail?: string;
  createdAt: string;
  expiresAt: string;
  token: string;
}

// Get workspace members
export const useWorkspaceMembers = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
      try {
        const response = await workspaceMemberDB.getWorkspaceMembers(
          workspaceId
        );
        return response.documents as unknown as WorkspaceMember[];
      } catch (error) {
        console.error("Failed to fetch workspace members:", error);
        throw error;
      }
    },
    enabled: !!workspaceId,
  });
};

// Get workspace invites
export const useWorkspaceInvites = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace-invites", workspaceId],
    queryFn: async () => {
      try {
        const response = await workspaceInviteDB.getWorkspaceInvites(
          workspaceId
        );
        return response.documents as unknown as WorkspaceInvite[];
      } catch (error) {
        console.error("Failed to fetch workspace invites:", error);
        throw error;
      }
    },
    enabled: !!workspaceId,
  });
};

// Get current user role in workspace
export const useUserWorkspaceRole = (workspaceId: string, userId: string) => {
  return useQuery({
    queryKey: ["user-workspace-role", workspaceId, userId],
    queryFn: async () => {
      try {
        const member = await workspaceMemberDB.getUserRole(workspaceId, userId);

        if (!member) {
          // Return null instead of throwing error
          return null;
        }

        return member as unknown as WorkspaceMember;
      } catch (error) {
        console.error("Failed to fetch user workspace role:", error);
        // Return null instead of throwing error for better UX
        return null;
      }
    },
    enabled: !!workspaceId && !!userId,
  });
};

// Auto-add user to workspace if not a member
export const useEnsureWorkspaceMembership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      workspaceId: string;
      userId: string;
      userEmail: string;
      userName: string;
      userAvatar?: string;
    }) => {
      try {
        // Check if user is already a member
        const existingMember = await workspaceMemberDB.getUserRole(
          data.workspaceId,
          data.userId
        );

        if (existingMember) {
          return existingMember;
        }

        // Add user as owner if no members exist, otherwise as member
        const members = await workspaceMemberDB.getWorkspaceMembers(
          data.workspaceId
        );
        const role = members.documents.length === 0 ? "owner" : "member";

        // Create new membership
        const newMember = await workspaceMemberDB.createMember({
          workspaceId: data.workspaceId,
          userId: data.userId,
          userEmail: data.userEmail,
          userName: data.userName,
          userAvatar: data.userAvatar,
          role: role,
        });

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ["user-workspace-role"] });
        queryClient.invalidateQueries({ queryKey: ["workspace-members"] });

        return newMember;
      } catch (error) {
        console.error("Failed to ensure workspace membership:", error);
        throw error;
      }
    },
  });
};

// Invite user to workspace
export const useInviteToWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      workspaceId: string;
      workspaceName: string;
      email: string;
      role: "admin" | "member" | "viewer";
      invitedBy: string;
      invitedByName: string;
    }) => {
      try {
        const response = await fetch("/api/send-invite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to send invitation");
        }

        const result = await response.json();
        return result.invite;
      } catch (error) {
        console.error("Failed to invite user:", error);
        throw error;
      }
    },
    onSuccess: (invite: any) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-invites", invite.workspaceId],
      });
    },
  });
};

// Update member role
export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      memberId: string;
      workspaceId: string;
      newRole: "admin" | "member" | "viewer";
    }) => {
      try {
        const updatedMember = await workspaceMemberDB.updateMemberRole(
          data.memberId,
          data.newRole
        );
        return updatedMember as unknown as WorkspaceMember;
      } catch (error) {
        console.error("Failed to update member role:", error);
        throw error;
      }
    },
    onSuccess: (member) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-members", member.workspaceId],
      });
    },
  });
};

// Remove member from workspace
export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { memberId: string; workspaceId: string }) => {
      try {
        const updatedMember = await workspaceMemberDB.removeMember(
          data.memberId
        );
        return updatedMember as unknown as WorkspaceMember;
      } catch (error) {
        console.error("Failed to remove member:", error);
        throw error;
      }
    },
    onSuccess: (member) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-members", member.workspaceId],
      });
    },
  });
};

// Cancel invite
export const useCancelInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { inviteId: string; workspaceId: string }) => {
      try {
        const updatedInvite = await workspaceInviteDB.updateInviteStatus(
          data.inviteId,
          "cancelled"
        );
        return updatedInvite as unknown as WorkspaceInvite;
      } catch (error) {
        console.error("Failed to cancel invite:", error);
        throw error;
      }
    },
    onSuccess: (invite) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-invites", invite.workspaceId],
      });
    },
  });
};

// Accept invite (for invited users)
export const useAcceptInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      token: string;
      userId: string;
      userName: string;
    }) => {
      try {
        // Find invite by token
        const invite = await workspaceInviteDB.getInviteByToken(data.token);

        if (!invite) {
          throw new Error("Invalid or expired invitation");
        }

        const inviteData = invite as unknown as WorkspaceInvite;

        // Check if invite is expired
        if (new Date(inviteData.expiresAt) < new Date()) {
          await workspaceInviteDB.updateInviteStatus(inviteData.$id, "expired");
          throw new Error("Invitation has expired");
        }

        // Create workspace member
        const member = await workspaceMemberDB.createMember({
          workspaceId: inviteData.workspaceId,
          userId: data.userId,
          userEmail: inviteData.email,
          userName: data.userName,
          userAvatar: undefined,
          role: inviteData.role,
          invitedBy: inviteData.invitedBy,
        });

        // Update invite status
        await workspaceInviteDB.updateInviteStatus(inviteData.$id, "accepted");

        return {
          member: member as unknown as WorkspaceMember,
          invite: inviteData,
        };
      } catch (error) {
        console.error("Failed to accept invite:", error);
        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-members", result.invite.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace-invites", result.invite.workspaceId],
      });
    },
  });
};
