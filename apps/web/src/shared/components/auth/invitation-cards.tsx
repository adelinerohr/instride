import { CheckIcon, XIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import { Spinner } from "../ui/spinner";

export function InvitationCard(props: {
  title: string;
  description: string;
  subject: React.ReactNode;
  submitting: "accept" | "reject" | false;
  onAnswer: (accept: boolean) => void;
  allowDecline: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-base lg:text-lg">
          {props.title}
        </CardTitle>
        <CardDescription className="text-center">
          {props.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center gap-3 rounded-lg border p-3">
          {props.subject}
        </div>

        <div className="flex gap-2">
          {props.allowDecline && (
            <Button
              variant="outline"
              className="flex-1"
              disabled={!!props.submitting}
              onClick={() => props.onAnswer(false)}
            >
              {props.submitting === "reject" ? (
                <Spinner />
              ) : (
                <XIcon className="size-4" />
              )}
              Decline
            </Button>
          )}
          <Button
            className="flex-1"
            disabled={!!props.submitting}
            onClick={() => props.onAnswer(true)}
          >
            {props.submitting === "accept" ? (
              <Spinner />
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

export function WrongAccountCard(props: {
  invitedEmail: string;
  currentEmail: string;
}) {
  return (
    <Card className="w-full border-transparent px-4 py-8 dark:border-border">
      <CardHeader>
        <CardTitle className="text-center text-base lg:text-lg">
          Wrong Account
        </CardTitle>
        <CardDescription className="text-center">
          This invitation was sent to{" "}
          <span className="font-medium">{props.invitedEmail}</span>. Please sign
          in with that email address to accept this invitation.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <p className="text-muted-foreground text-center text-sm">
          You are currently signed in as{" "}
          <span className="font-medium">{props.currentEmail}</span>.
        </p>
      </CardContent>
    </Card>
  );
}
