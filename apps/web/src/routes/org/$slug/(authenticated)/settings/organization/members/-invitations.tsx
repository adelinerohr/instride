import { invitationOptions, membersOptions, type types } from "@instride/api";
import { InvitationStatus, MembershipRole } from "@instride/shared";
import { ROLE_LABELS, ROLE_VARIANTS } from "@instride/utils";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
  CheckIcon,
  ClockIcon,
  MoreVerticalIcon,
  UserKeyIcon,
  UserPlusIcon,
  UserXIcon,
  XIcon,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { changeRoleModalHandler } from "@/features/organization/components/members/modals/role-modal";
import { UserAvatarItem } from "@/shared/components/fragments/user-avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { DialogTrigger } from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { authClient } from "@/shared/lib/auth/client";
import { hasAnyRole, isAdmin } from "@/shared/lib/auth/roles";
import { cn } from "@/shared/lib/utils";

import { Route } from "./index";

export function TeamMembersCard() {
  const [activeTab, setActiveTab] = React.useState<"active" | "pending">(
    "active"
  );
  const { data: invitations } = useSuspenseQuery(invitationOptions.list());
  const { data: members } = useSuspenseQuery(membersOptions.all());

  const pendingInvitations = invitations.filter(
    (invitation) => invitation.status === InvitationStatus.PENDING
  );

  const activeTeamMembers = members.filter((member) =>
    hasAnyRole(member, [MembershipRole.ADMIN, MembershipRole.TRAINER])
  );

  return (
    <Card>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active">Active Team Members</TabsTrigger>
            <TabsTrigger value="pending">Pending Invitations</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="divide-y py-2">
            {activeTeamMembers.length > 0 ? (
              activeTeamMembers.map((member) => (
                <MemberRow key={member.id} type="active" member={member} />
              ))
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <UserPlusIcon className="size-6" />
                  </EmptyMedia>
                </EmptyHeader>
              </Empty>
            )}
          </TabsContent>
          <TabsContent value="pending" className="divide-y py-2">
            {pendingInvitations.length > 0 ? (
              pendingInvitations.map((invitation) => (
                <MemberRow
                  key={invitation.id}
                  type="pending"
                  invitation={invitation}
                />
              ))
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <UserPlusIcon />
                  </EmptyMedia>
                  <EmptyTitle>No pending invitations</EmptyTitle>
                  <EmptyDescription>
                    Place an invitation to a team member by email and assign
                    them a role.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface ActiveMemberRowProps {
  type: "active";
  member: types.Member;
}

interface PendingInvitationRowProps {
  type: "pending";
  invitation: types.Invitation;
}

type MemberRowProps = ActiveMemberRowProps | PendingInvitationRowProps;

function MemberRow(props: MemberRowProps) {
  const { user, organization } = Route.useRouteContext();
  const queryClient = useQueryClient();

  const roles =
    props.type === "active" ? props.member.roles : props.invitation.role;

  const getInvitationStatusIcon = (status: InvitationStatus) => {
    return {
      [InvitationStatus.PENDING]: ClockIcon,
      [InvitationStatus.ACCEPTED]: CheckIcon,
      [InvitationStatus.REJECTED]: XIcon,
      [InvitationStatus.CANCELLED]: XIcon,
    }[status];
  };

  const revokeInvitation = (invitationId: string) => {
    toast.promise(
      async () => {
        const { error } = await authClient.organization.cancelInvitation({
          invitationId,
        });

        if (error) {
          throw error;
        }
      },
      {
        loading: "Revoking invitation...",
        success: () => {
          queryClient.invalidateQueries(invitationOptions.list());
          return "Invitation successfully revoked.";
        },
        error: "Failed to revoke invitation. Please try again.",
      }
    );
  };

  const removeMember = (memberId: string) => {
    toast.promise(
      async () => {
        await authClient.organization.removeMember({
          memberIdOrEmail: memberId,
          organizationId: organization.id,
        });
      },
      {
        loading: "Removing member...",
        success: () => {
          queryClient.invalidateQueries(membersOptions.all());
          return "Member removed successfully.";
        },
        error: "Could not remove member. Please try again.",
      }
    );
  };

  const isInvitationRow = props.type === "pending";

  const renderInvitationStatusIcon = () => {
    if (!isInvitationRow) return;
    const Icon = getInvitationStatusIcon(props.invitation.status);
    return <Icon className="size-3 shrink-0" />;
  };

  const activeUser = !isInvitationRow ? props.member.authUser : null;

  return (
    <div className="flex gap-4 items-center justify-between">
      {isInvitationRow ? (
        <div className="leading-normal">
          <strong
            className={cn("block", {
              "opacity-50":
                props.invitation.status === InvitationStatus.CANCELLED,
            })}
          >
            {props.invitation.email}
          </strong>
          <small className="flex flex-wrap gap-1 text-foreground/60">
            <span className="flex items-center gap-0.5 uppercase">
              {renderInvitationStatusIcon()}
              {props.invitation.status}
            </span>
            <span>-</span>
            <span>
              Expires at {new Date(props.invitation.expiresAt).toLocaleString()}
            </span>
          </small>
        </div>
      ) : (
        <UserAvatarItem
          user={activeUser!}
          description={activeUser?.email}
          size="sm"
        />
      )}

      <div className="flex flex-row items-center gap-2">
        {roles.map((role) => (
          <Badge key={role} variant={ROLE_VARIANTS[role]}>
            {ROLE_LABELS[role]}
          </Badge>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" type="button" />}
          >
            <MoreVerticalIcon className="shrink-0" />
          </DropdownMenuTrigger>
          {!isInvitationRow ? (
            <DropdownMenuContent>
              <DialogTrigger
                handle={changeRoleModalHandler}
                payload={{
                  member: props.member,
                }}
                render={<DropdownMenuItem />}
              >
                <UserKeyIcon />
                Change roles
              </DialogTrigger>
              <DropdownMenuSeparator />
              {props.member.authUser?.id !== user?.id && (
                <DropdownMenuItem
                  className="text-destructive"
                  disabled={!isAdmin(props.member)}
                  onClick={async () => removeMember(props.member.id)}
                >
                  <UserXIcon />
                  Remove member
                </DropdownMenuItem>
              )}
              {props.member.authUser?.id === user?.id && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={async () => removeMember(props.member.id)}
                >
                  <UserXIcon />
                  Leave organization
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          ) : (
            <DropdownMenuContent>
              <DropdownMenuItem
                disabled={props.invitation.status !== InvitationStatus.PENDING}
                onClick={() => revokeInvitation(props.invitation.id)}
              >
                Revoke Invitation
              </DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </div>
    </div>
  );
}
