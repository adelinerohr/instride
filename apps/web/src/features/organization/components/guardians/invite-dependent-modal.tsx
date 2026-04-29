import { APIError, useSendDependentInvitation } from "@instride/api";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHandler,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useAppForm } from "@/shared/hooks/use-form";

export interface InviteDependentModalPayload {
  relationshipId: string;
  dependentName: string;
}

export const inviteDependentModalHandler =
  DialogHandler.createHandle<InviteDependentModalPayload>();

export function InviteDependentModal() {
  return (
    <Dialog handle={inviteDependentModalHandler}>
      {({ payload }) => (
        <DialogPortal>
          {payload && <InviteDependentForm payload={payload} />}
        </DialogPortal>
      )}
    </Dialog>
  );
}

function InviteDependentForm({
  payload,
}: {
  payload: InviteDependentModalPayload;
}) {
  const sendInvitation = useSendDependentInvitation();

  const form = useAppForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: z.object({
        email: z
          .string()
          .trim()
          .min(1, "Email is required")
          .email("Enter a valid email address"),
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        await sendInvitation.mutateAsync({
          relationshipId: payload.relationshipId,
          email: value.email.trim(),
        });
        toast.success("Invitation sent successfully");
        inviteDependentModalHandler.close();
      } catch (error) {
        toast.error(
          error instanceof APIError
            ? error.message
            : "Failed to send invitation"
        );
      }
    },
  });

  return (
    <DialogContent>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <DialogHeader>
          <DialogTitle>Invite {payload.dependentName}</DialogTitle>
          <DialogDescription>
            We&apos;ll email them a link to create their login and join the
            portal. Use the email they&apos;ll use to sign up.
          </DialogDescription>
        </DialogHeader>
        <form.AppField
          name="email"
          children={(field) => (
            <field.TextField
              autoComplete="email"
              label="Their email"
              placeholder="dependent@example.com"
              type="email"
            />
          )}
        />
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancel
          </DialogClose>
          <form.AppForm>
            <form.SubmitButton label="Send invite" loadingLabel="Sending…" />
          </form.AppForm>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
