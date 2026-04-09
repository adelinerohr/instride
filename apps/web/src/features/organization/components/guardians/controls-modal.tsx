import { useUpdateGuardianRelationship, type types } from "@instride/api";
import { toast } from "sonner";
import z from "zod";

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
import { FieldGroup } from "@/shared/components/ui/field";
import { useAppForm } from "@/shared/hooks/form";

export const guardianControlsModalHandler = DialogHandler.createHandle<{
  relationship: types.GuardianRelationship;
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
  relationship: types.GuardianRelationship;
}

export function GuardianControlsModalForm({
  relationship,
}: GuardianControlsModalFormProps) {
  const updateGuardianRelationship = useUpdateGuardianRelationship();
  if (!relationship.dependent) return null;

  const form = useAppForm({
    defaultValues: {
      canBookLessons: relationship.canBookLessons ?? false,
      canPostOnFeed: relationship.canPostOnFeed ?? false,
    },
    validators: {
      onSubmit: z.object({
        canBookLessons: z.boolean(),
        canPostOnFeed: z.boolean(),
      }),
    },
    onSubmit: async ({ value }) => {
      await updateGuardianRelationship.mutateAsync(
        {
          relationshipId: relationship.id,
          request: {
            canBookLessons: value.canBookLessons,
            canPostOnFeed: value.canPostOnFeed,
          },
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
        <FieldGroup>
          <form.AppField
            name="canBookLessons"
            children={(field) => (
              <field.SwitchField
                label="Can Book Lessons"
                description="Allow this dependent to book their own lessons"
              />
            )}
          />
          <form.AppField
            name="canPostOnFeed"
            children={(field) => (
              <field.SwitchField
                label="Can Post on Feed"
                description="Allow this dependent to post updates on the community feed"
              />
            )}
          />
        </FieldGroup>
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
