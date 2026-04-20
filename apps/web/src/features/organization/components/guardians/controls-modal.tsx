import { useUpdateGuardianRelationship, type types } from "@instride/api";
import { toast } from "sonner";

import { GuardianControlsStep } from "@/features/onboarding/components/steps/guardian-controls";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHandler,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useAppForm } from "@/shared/hooks/use-form";

export const guardianControlsModalHandler = DialogHandler.createHandle<{
  relationship: types.GuardianRelationshipWithDependent;
}>();

export function GuardianControlsModal() {
  return (
    <Dialog handle={guardianControlsModalHandler}>
      {({ payload }) => (
        <DialogPortal>
          {payload && (
            <GuardianControlsModalForm relationship={payload.relationship} />
          )}
        </DialogPortal>
      )}
    </Dialog>
  );
}

interface GuardianControlsModalFormProps {
  relationship: types.GuardianRelationshipWithDependent;
}

export function GuardianControlsModalForm({
  relationship,
}: GuardianControlsModalFormProps) {
  const updateGuardianRelationship = useUpdateGuardianRelationship();
  if (!relationship.dependent) return null;

  const form = useAppForm({
    defaultValues: {
      permissions: {
        bookings: {
          canBookLessons:
            relationship.permissions?.bookings.canBookLessons ?? false,
          canJoinEvents:
            relationship.permissions?.bookings.canJoinEvents ?? false,
          requiresApproval:
            relationship.permissions?.bookings.requiresApproval ?? false,
          canCancel: relationship.permissions?.bookings.canCancel ?? false,
        },
        communication: {
          canPost: relationship.permissions?.communication.canPost ?? false,
          canComment:
            relationship.permissions?.communication.canComment ?? false,
          receiveEmailNotifications:
            relationship.permissions?.communication.receiveEmailNotifications ??
            false,
          receiveTextNotifications:
            relationship.permissions?.communication.receiveTextNotifications ??
            false,
        },
        profile: {
          canEdit: relationship.permissions?.profile.canEdit ?? false,
        },
      },
    },
    onSubmit: async ({ value }) => {
      await updateGuardianRelationship.mutateAsync(
        {
          relationshipId: relationship.id,
          params: value,
        },
        {
          onSuccess: () => {
            toast.success("Controls updated");
            guardianControlsModalHandler.close();
          },
          onError: (error) => {
            toast.error("Failed to update controls");
            console.error(error);
          },
        }
      );
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
          <DialogTitle>
            Edit {relationship.dependent.authUser?.name}'s Controls
          </DialogTitle>
        </DialogHeader>
        <GuardianControlsStep form={form} fields="permissions" />
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <form.AppForm>
            <form.SubmitButton label="Save changes" loadingLabel="Saving..." />
          </form.AppForm>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
