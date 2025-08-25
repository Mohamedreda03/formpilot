"use client";

import { useState, useEffect } from "react";
import {
  UserPlus,
  Users,
  Crown,
  Shield,
  User,
  Eye,
  Mail,
  Trash2,
  Edit3,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  useWorkspaceMembers,
  useWorkspaceInvites,
  useInviteToWorkspace,
  useUpdateMemberRole,
  useRemoveMember,
  useCancelInvite,
  useUserWorkspaceRole,
  useEnsureWorkspaceMembership,
  type WorkspaceMember,
  type WorkspaceInvite,
} from "@/hooks/use-team-management";
import { useAuth } from "@/contexts/AuthContext";

// Helper functions for permissions
const canUserManageMember = (
  currentUserRole: string,
  targetMemberRole: string
): boolean => {
  // Owner can manage everyone
  if (currentUserRole === "owner") {
    return true;
  }

  // Admin can manage member and viewer, but not owner or other admins
  if (currentUserRole === "admin") {
    return targetMemberRole === "member" || targetMemberRole === "viewer";
  }

  // Member and viewer cannot manage anyone
  return false;
};

const canUserInvite = (currentUserRole: string): boolean => {
  return currentUserRole === "owner" || currentUserRole === "admin";
};

const getInvitableRoles = (
  currentUserRole: string
): Array<"admin" | "member" | "viewer"> => {
  if (currentUserRole === "owner") {
    return ["admin", "member", "viewer"];
  }

  if (currentUserRole === "admin") {
    return ["member", "viewer"];
  }

  return [];
};

const getEditableRoles = (
  currentUserRole: string,
  targetMemberRole: string
): Array<"owner" | "admin" | "member" | "viewer"> => {
  if (currentUserRole === "owner") {
    // Owner can set any role except downgrading themselves from owner
    return ["admin", "member", "viewer"];
  }

  if (
    currentUserRole === "admin" &&
    (targetMemberRole === "member" || targetMemberRole === "viewer")
  ) {
    // Admin can only edit member/viewer roles, and only to member/viewer
    return ["member", "viewer"];
  }

  return [];
};

// Role configurations
const roleConfig = {
  owner: {
    label: "Owner",
    description: "Full access and control",
    icon: Crown,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  admin: {
    label: "Admin",
    description: "Can manage members and forms",
    icon: Shield,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  member: {
    label: "Member",
    description: "Can create and edit forms",
    icon: User,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  viewer: {
    label: "Viewer",
    description: "Can only view forms and data",
    icon: Eye,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
};

// Invite Modal Component
function InviteModal({
  open,
  onOpenChange,
  workspaceId,
  workspaceName,
  onSuccess,
  currentUserRole,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  workspaceName: string;
  onSuccess?: () => void;
  currentUserRole: string;
}) {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member" | "viewer">("member");

  const inviteToWorkspace = useInviteToWorkspace();

  // Get invitable roles based on current user's role
  const invitableRoles = getInvitableRoles(currentUserRole);

  // Check if user can invite
  const canInvite = canUserInvite(currentUserRole);

  // Set default role based on available roles
  useEffect(() => {
    if (invitableRoles.length > 0 && !invitableRoles.includes(role)) {
      setRole(invitableRoles[0]);
    }
  }, [invitableRoles, role]);

  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await inviteToWorkspace.mutateAsync({
        workspaceId,
        workspaceName,
        email: email.trim(),
        role,
        invitedBy: user?.$id || "",
        invitedByName: user?.name || "Someone",
      });

      toast.success(`Invitation email sent to ${email}`);
      setEmail("");
      setRole("member");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to send invitation");
    }
  };

  const resetForm = () => {
    setEmail("");
    setRole("member");
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Invite someone to join <strong>{workspaceName}</strong> workspace
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value: "admin" | "member" | "viewer") =>
                setRole(value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {role && (
                    <div className="flex items-center gap-3">
                      {(() => {
                        const IconComponent =
                          roleConfig[role as keyof typeof roleConfig]?.icon;
                        return IconComponent ? (
                          <IconComponent className="h-4 w-4" />
                        ) : null;
                      })()}
                      <span className="font-medium">
                        {roleConfig[role as keyof typeof roleConfig]?.label}
                      </span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleConfig)
                  .filter(([key]) => invitableRoles.includes(key as any))
                  .map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-3">
                        <config.icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{config.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {config.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={inviteToWorkspace.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleInvite}
            disabled={
              inviteToWorkspace.isPending || !email.trim() || !canInvite
            }
          >
            {inviteToWorkspace.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Role Modal Component
function EditRoleModal({
  member,
  open,
  onOpenChange,
  onUpdate,
  currentUserRole,
}: {
  member: WorkspaceMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
  currentUserRole: string;
}) {
  const [selectedRole, setSelectedRole] = useState<
    "owner" | "admin" | "member" | "viewer"
  >("member");
  const updateMemberRole = useUpdateMemberRole();

  // Get editable roles based on current user's role and target member's role
  const editableRoles = member
    ? getEditableRoles(currentUserRole, member.role)
    : [];

  // Check if current user can manage this member
  const canManage = member
    ? canUserManageMember(currentUserRole, member.role)
    : false;

  useEffect(() => {
    if (member) {
      setSelectedRole(member.role);
    }
  }, [member]);

  const handleUpdateRole = async () => {
    if (!member || selectedRole === member.role) {
      onOpenChange(false);
      return;
    }

    try {
      await updateMemberRole.mutateAsync({
        memberId: member.$id,
        workspaceId: member.workspaceId,
        newRole: selectedRole as "admin" | "member" | "viewer",
      });

      toast.success("Member role updated successfully");
      onOpenChange(false);
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to update member role");
    }
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Member Role
          </DialogTitle>
          <DialogDescription>
            Update permissions for {member.userName || member.userEmail}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.userAvatar} />
                  <AvatarFallback>
                    {(member.userName || member.userEmail)?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {member.userName || "Unknown"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {member.userEmail}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value: "owner" | "admin" | "member" | "viewer") =>
                setSelectedRole(value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {selectedRole && (
                    <div className="flex items-center gap-3">
                      {(() => {
                        const IconComponent =
                          roleConfig[selectedRole as keyof typeof roleConfig]
                            ?.icon;
                        return IconComponent ? (
                          <IconComponent className="h-4 w-4" />
                        ) : null;
                      })()}
                      <span className="font-medium">
                        {
                          roleConfig[selectedRole as keyof typeof roleConfig]
                            ?.label
                        }
                      </span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleConfig)
                  .filter(
                    ([key]) =>
                      key === selectedRole || // Always include current role
                      editableRoles.includes(key as any) // Include editable roles
                  )
                  .map(([key, config]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      disabled={
                        !editableRoles.includes(key as any) &&
                        key !== selectedRole
                      }
                    >
                      <div className="flex items-center gap-3">
                        <config.icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{config.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {config.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateRole}
            disabled={
              updateMemberRole.isPending ||
              selectedRole === member.role ||
              !canManage
            }
          >
            {updateMemberRole.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Role"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Team Modal Component
function TeamModal({
  open,
  onOpenChange,
  workspaceId,
  workspaceName,
  onRefresh,
  currentUserRole,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  workspaceName: string;
  onRefresh?: () => void;
  currentUserRole: string;
}) {
  const { user } = useAuth();
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(
    null
  );
  const [editRoleOpen, setEditRoleOpen] = useState(false);

  const { data: members = [], refetch: refetchMembers } =
    useWorkspaceMembers(workspaceId);
  const { data: invites = [], refetch: refetchInvites } =
    useWorkspaceInvites(workspaceId);
  const removeMember = useRemoveMember();
  const cancelInvite = useCancelInvite();

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (
      !confirm(
        `Are you sure you want to remove ${memberName} from this workspace?`
      )
    ) {
      return;
    }

    try {
      await removeMember.mutateAsync({
        memberId,
        workspaceId,
      });
      toast.success("Member removed from workspace");
      refetchMembers();
      onRefresh?.();
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const handleCancelInvite = async (inviteId: string, email: string) => {
    if (!confirm(`Cancel invitation for ${email}?`)) {
      return;
    }

    try {
      await cancelInvite.mutateAsync({
        inviteId,
        workspaceId,
      });
      toast.success("Invitation cancelled");
      refetchInvites();
    } catch (error) {
      toast.error("Failed to cancel invitation");
    }
  };

  const handleEditRole = (member: WorkspaceMember) => {
    setSelectedMember(member);
    setEditRoleOpen(true);
  };

  const handleRoleUpdate = () => {
    refetchMembers();
    onRefresh?.();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Management
            </DialogTitle>
            <DialogDescription>
              Manage members and invitations for{" "}
              <strong>{workspaceName}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Members Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Members</h3>
                {members.length === 0 ? (
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                ) : (
                  <Badge variant="outline">{members.length} members</Badge>
                )}
              </div>

              <div className="space-y-3">
                {members.map((member) => {
                  const config = roleConfig[member.role];
                  return (
                    <div
                      key={member.$id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.userAvatar} />
                          <AvatarFallback>
                            {(member.userName ||
                              member.userEmail)?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {member.userName || "Unknown"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.userEmail}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`${config.color} ${config.bgColor} border-current`}
                        >
                          <config.icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                        {canUserManageMember(currentUserRole, member.role) && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRole(member)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveMember(
                                  member.$id,
                                  member.userName || member.userEmail
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pending Invitations */}
            {invites.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Pending Invitations</h3>
                    <Badge variant="outline">{invites.length} pending</Badge>
                  </div>

                  <div className="space-y-3">
                    {invites.map((invite) => {
                      const config = roleConfig[invite.role];
                      return (
                        <div
                          key={invite.$id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {invite.email[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{invite.email}</div>
                              <div className="text-sm text-muted-foreground">
                                Invited • {invite.status}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`${config.color} ${config.bgColor} border-current`}
                            >
                              <config.icon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCancelInvite(invite.$id, invite.email)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <EditRoleModal
        member={selectedMember}
        open={editRoleOpen}
        onOpenChange={setEditRoleOpen}
        onUpdate={handleRoleUpdate}
        currentUserRole={currentUserRole}
      />
    </>
  );
}

// Main TeamManagement Component
interface TeamManagementProps {
  workspaceId: string;
  workspaceName: string;
}

export default function TeamManagement({
  workspaceId,
  workspaceName,
}: TeamManagementProps) {
  const { user } = useAuth();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);

  const { data: userRole } = useUserWorkspaceRole(workspaceId, user?.$id || "");
  const { refetch: refetchMembers } = useWorkspaceMembers(workspaceId);
  const { refetch: refetchInvites } = useWorkspaceInvites(workspaceId);
  const ensureMembership = useEnsureWorkspaceMembership();

  // Auto-add user to workspace if not a member
  useEffect(() => {
    if (user && workspaceId && !userRole) {
      ensureMembership.mutate({
        workspaceId,
        userId: user.$id,
        userEmail: user.email,
        userName: user.name,
        userAvatar: undefined, // Appwrite user doesn't have avatar property
      });
    }
  }, [user, workspaceId, userRole, ensureMembership]);

  if (!user) {
    return null;
  }

  // Show loading while checking/adding membership
  if (!userRole && ensureMembership.isPending) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Setting up workspace access...</span>
      </div>
    );
  }

  // If still no role after auto-add attempt, show access denied
  if (!userRole) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">
          You don't have access to this workspace.
        </p>
      </div>
    );
  }

  const canInvite = canUserInvite(userRole.role);

  const handleRefresh = () => {
    refetchMembers();
    refetchInvites();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {canInvite && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInviteOpen(true)}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Invite
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setTeamOpen(true)}
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          Team
        </Button>
      </div>

      <InviteModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        workspaceId={workspaceId}
        workspaceName={workspaceName}
        onSuccess={handleRefresh}
        currentUserRole={userRole?.role || ""}
      />

      <TeamModal
        open={teamOpen}
        onOpenChange={setTeamOpen}
        workspaceId={workspaceId}
        workspaceName={workspaceName}
        onRefresh={handleRefresh}
        currentUserRole={userRole?.role || ""}
      />
    </>
  );
}
