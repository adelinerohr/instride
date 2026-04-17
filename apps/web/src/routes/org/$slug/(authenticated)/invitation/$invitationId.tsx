import { membersOptions } from "@instride/api";
import { createFileRoute } from "@tanstack/react-router";
import { APIError } from "better-auth";
import { CheckIcon, XIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { OrganizationLogo } from "@/shared/components/fragments/org-logo";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { authClient } from "@/shared/lib/auth/client";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/invitation/$invitationId"
)({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { data, error } = await authClient.organization.getInvitation({
      query: {
        id: params.invitationId,
      },
    });

    if (error) {
      throw error;
    }

    return { invitation: data };
  },
});

function RouteComponent() {
  const { invitation } = Route.useLoaderData();
  const { user, queryClient, organization } = Route.useRouteContext();
  const navigate = Route.useNavigate();

  const [submitting, setSubmitting] = React.useState<
    "accept" | "reject" | false
  >(false);

  const onSelectAnswer = async (accept: boolean) => {
    setSubmitting(accept ? "accept" : "reject");
    try {
      if (accept) {
        const { error } = await authClient.organization.acceptInvitation({
          invitationId: invitation.id,
        });

        if (error) throw error;

        await queryClient.invalidateQueries({
          queryKey: membersOptions.all().queryKey,
        });
      } else {
        const { error } = await authClient.organization.rejectInvitation({
          invitationId: invitation.id,
        });

        if (error) throw error;

        navigate({ to: "/" });
      }
    } catch (error) {
      const message =
        error instanceof APIError ? error.message : "An unknown error occurred";
      toast.error(message);
    }
  };

  const isRecipient =
    user.email.toLowerCase() === invitation.email.toLowerCase();

  if (!isRecipient) {
    return (
      <Card className="w-full border-transparent px-4 py-8 dark:border-border">
        <CardHeader>
          <CardTitle className="text-center text-base lg:text-lg">
            Wrong Account
          </CardTitle>
          <CardDescription className="text-center">
            This invitation was sent to{" "}
            <span className="font-medium">{invitation.email}</span>. Please sign
            in with that email address to accept this invitation.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground text-center text-sm">
            You are currently signed in as{" "}
            <span className="font-medium">{user.email}</span>.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-transparent px-4 py-8 dark:border-border">
      <CardHeader>
        <CardTitle className="text-center text-base lg:text-lg">
          You've been invited
        </CardTitle>
        <CardDescription className="text-center">
          {organization.name} has invited you to join their organization.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Organization Info */}
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <OrganizationLogo organization={organization} className="size-10" />
          <div>
            <p className="font-semibold text-sm">{organization.name}</p>
            <p className="text-muted-foreground text-xs">Organization</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            disabled={!!submitting}
            onClick={() => onSelectAnswer(false)}
          >
            {submitting === "reject" ? (
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <XIcon className="size-4" />
            )}
            Decline
          </Button>
          <Button
            className="flex-1"
            disabled={!!submitting}
            onClick={() => onSelectAnswer(true)}
          >
            {submitting === "accept" ? (
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <CheckIcon className="size-4" />
            )}
            Accept
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
