import { useSendInvitation } from "@instride/api";
import { MembershipRole } from "@instride/shared";
import { useRouteContext } from "@tanstack/react-router";
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

export const guardianInvitationModalHandler = AlertDialogHandler.createHandle();

export function GuardianInvitationModal() {
  const { organization } = useRouteContext({ strict: false });
  const sendInvitation = useSendInvitation();

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

      sendInvitation.mutate(
        {
          organizationId: organization.id,
          email: value.guardianEmail,
          roles: [MembershipRole.GUARDIAN],
        },
        {
          onSuccess: () => {
            toast.success("Invitation sent successfully");
            guardianInvitationModalHandler.close();
          },
          onError: (error) => {
            toast.error(error.message ?? "Failed to send invitation");
          },
        }
      );
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
