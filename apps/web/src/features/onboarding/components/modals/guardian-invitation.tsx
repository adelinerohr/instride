import { MembershipRole } from "@instride/shared";
import { useRouteContext } from "@tanstack/react-router";
import { APIError } from "better-auth";
import { toast } from "sonner";
import z from "zod";

import {
  DialogHandler,
  Dialog,
  DialogPortal,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { useAppForm } from "@/shared/hooks/use-form";
import { authClient } from "@/shared/lib/auth/client";

export const guardianInvitationModalHandler = DialogHandler.createHandle();

export function GuardianInvitationModal() {
  const { organization } = useRouteContext({ strict: false });

  const form = useAppForm({
    defaultValues: {
      guardianEmail: "",
    },
    validators: {
      onSubmit: z.object({
        guardianEmail: z
          .email("Please enter a valid email address")
          .trim()
          .min(1, "Guardian's email is required"),
      }),
    },
    onSubmit: async ({ value }) => {
      if (!organization) return;

      try {
        const { error } = await authClient.organization.inviteMember({
          email: value.guardianEmail,
          role: [MembershipRole.GUARDIAN],
          organizationId: organization.authOrganizationId,
        });

        if (error) throw error;

        toast.success("Invitation sent successfully");
        guardianInvitationModalHandler.close();
      } catch (error) {
        const message =
          error instanceof APIError
            ? error.message
            : "An unknown error occurred";
        toast.error(message);
      }
    },
  });

  return (
    <Dialog handle={guardianInvitationModalHandler}>
      <DialogPortal>
        <DialogContent className="sm:max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <DialogHeader>
              <DialogTitle>Guardian Required</DialogTitle>
              <DialogDescription>
                You must be 18 or older to complete registration on your own.
                Please provide your parent or guardian's email address to
                continue. They will receive an invitation to complete your
                registration.
              </DialogDescription>
            </DialogHeader>
            <form.AppField
              name="guardianEmail"
              children={(field) => (
                <field.TextField
                  label="Guardian's Email"
                  placeholder="parent@example.com"
                />
              )}
            />
            <DialogFooter>
              <form.AppForm>
                <form.SubmitButton label="Send Invitation" />
              </form.AppForm>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
