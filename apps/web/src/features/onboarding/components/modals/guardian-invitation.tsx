import { MembershipRole } from "@instride/shared";
import { useRouteContext } from "@tanstack/react-router";
import { APIError } from "better-auth";
import { toast } from "sonner";
import z from "zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHandler,
  AlertDialogHeader,
  AlertDialogPortal,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { useAppForm } from "@/shared/hooks/use-form";
import { authClient } from "@/shared/lib/auth/client";

export const guardianInvitationModalHandler = AlertDialogHandler.createHandle();

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
    <AlertDialog handle={guardianInvitationModalHandler}>
      <AlertDialogPortal>
        <AlertDialogContent className="sm:max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Guardian Required</AlertDialogTitle>
              <AlertDialogDescription>
                You must be 18 or older to complete registration on your own.
                Please provide your parent or guardian's email address to
                continue. They will receive an invitation to complete your
                registration.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <form.AppField
              name="guardianEmail"
              children={(field) => (
                <field.TextField
                  label="Guardian's Email"
                  placeholder="parent@example.com"
                />
              )}
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <form.AppForm>
                <AlertDialogAction
                  render={<form.SubmitButton label="Send Invitation" />}
                />
              </form.AppForm>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
}
