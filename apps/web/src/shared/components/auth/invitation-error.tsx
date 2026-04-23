import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";

export function InvalidInvitationCard() {
  const navigate = useNavigate({ from: "/org/$slug/invitation/$token" });

  // Optionally inspect error to distinguish "not found" from "expired"
  // from "network error" etc., and adjust the message.

  return (
    <Card className="w-full border-transparent px-4 py-8 dark:border-border">
      <CardHeader>
        <CardTitle className="text-center text-base lg:text-lg">
          Invitation Unavailable
        </CardTitle>
        <CardDescription className="text-center">
          This invitation link is invalid or has expired. If you believe this is
          a mistake, ask whoever invited you to send a new invitation.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button variant="outline" onClick={() => navigate({ to: "/" })}>
          Go home
        </Button>
      </CardContent>
    </Card>
  );
}
