import {
  APIError,
  useAcceptGuardianInvitation,
  type AuthUser,
  type GuardianInvitationWithContext,
} from "@instride/api";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";

import {
  InvitationCard,
  WrongAccountCard,
} from "@/shared/components/auth/invitation-cards";

interface GuardianInvitationCardProps {
  invitation: GuardianInvitationWithContext;
  user: AuthUser;
}

export function GuardianInvitationCard({
  invitation,
  user,
}: GuardianInvitationCardProps) {
  const navigate = useNavigate({ from: "/org/$slug/invitation/$token" });

  const acceptMutation = useAcceptGuardianInvitation();
  const [submitting, setSubmitting] = React.useState<"accept" | false>(false);

  const isRecipient =
    user.email.toLowerCase() === invitation.email.toLowerCase();

  if (!isRecipient) {
    return (
      <WrongAccountCard
        invitedEmail={invitation.email}
        currentEmail={user.email}
      />
    );
  }

  const onAccept = async () => {
    setSubmitting("accept");
    try {
      await acceptMutation.mutateAsync(invitation.token);

      // Router will naturally let them into the app now that
      // onboardingComplete is true on their member record.
      navigate({
        to: "/org/$slug/portal",
        params: { slug: invitation.organizationSlug },
      });
    } catch (error) {
      const message =
        error instanceof APIError ? error.message : "An unknown error occurred";
      toast.error(message);
      setSubmitting(false);
    }
  };

  return (
    <InvitationCard
      title={`Welcome, ${invitation.dependentName}`}
      description={`${invitation.guardianName} has set up your account at ${invitation.organizationName}. Accept to start using the app.`}
      subject={
        <div>
          <p className="font-semibold text-sm">{invitation.guardianName}</p>
          <p className="text-muted-foreground text-xs">
            Your guardian · {invitation.organizationName}
          </p>
        </div>
      }
      submitting={submitting}
      onAnswer={onAccept}
      allowDecline={false}
    />
  );
}
