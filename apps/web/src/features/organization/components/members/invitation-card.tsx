import { membersOptions, type types } from "@instride/api";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { APIError } from "better-auth";
import * as React from "react";
import { toast } from "sonner";

import {
  InvitationCard,
  WrongAccountCard,
} from "@/shared/components/auth/invitation-cards";
import { OrganizationLogo } from "@/shared/components/fragments/org-logo";
import { authClient } from "@/shared/lib/auth/client";

interface OrganizationInvitationCardProps {
  invitationId: string;
  invitationEmail: string;
  user: types.AuthUser;
  organization: types.Organization;
}

export function OrganizationInvitationCard({
  invitationId,
  invitationEmail,
  user,
  organization,
}: OrganizationInvitationCardProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate({ from: "/org/$slug/invitation/$token" });

  const [submitting, setSubmitting] = React.useState<
    "accept" | "reject" | false
  >(false);

  const onAnswer = async (accept: boolean) => {
    setSubmitting(accept ? "accept" : "reject");
    try {
      if (accept) {
        const { error } = await authClient.organization.acceptInvitation({
          invitationId,
        });

        if (error) throw error;

        await queryClient.invalidateQueries({
          queryKey: membersOptions.all().queryKey,
        });

        navigate({ to: "/org/$slug/onboarding" });
      } else {
        const { error } = await authClient.organization.rejectInvitation({
          invitationId,
        });

        if (error) throw error;
      }
    } catch (error) {
      const message =
        error instanceof APIError ? error.message : "An unknown error occurred";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const isRecipient =
    user.email.toLowerCase() === invitationEmail.toLowerCase();

  if (!isRecipient) {
    return (
      <WrongAccountCard
        invitedEmail={invitationEmail}
        currentEmail={user.email}
      />
    );
  }

  return (
    <InvitationCard
      title="You've been invited"
      description={`${organization.name} has invited you to join their organization.`}
      subject={
        <>
          <OrganizationLogo organization={organization} className="size-10" />
          <div>
            <p className="font-semibold text-sm">{organization.name}</p>
            <p className="text-muted-foreground text-xs">Organization</p>
          </div>
        </>
      }
      submitting={submitting}
      onAnswer={onAnswer}
      allowDecline
    />
  );
}
