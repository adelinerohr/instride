import { getUser, useUpdateRider, type Rider } from "@instride/api";
import { returnStringOrNull } from "@instride/shared";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogPortal,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "@/shared/components/ui/dialog";
import { useAppForm } from "@/shared/hooks/use-form";
import { defineModal } from "@/shared/lib/stores/modal.store";

interface EmergencyContactModalPayload {
  rider: Rider;
}

export function EmergencyContactModalComponent() {
  const { isOpen, payload, onOpenChange } = EmergencyContactModal.useModal();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {payload && (
        <DialogPortal>
          {payload && <EmergencyContactModalForm {...payload} />}
        </DialogPortal>
      )}
    </Dialog>
  );
}

export const EmergencyContactModal = defineModal<EmergencyContactModalPayload>({
  id: "emergency-contact-modal",
  component: EmergencyContactModalComponent,
});

export function EmergencyContactModalForm({
  rider,
}: EmergencyContactModalPayload) {
  const modal = EmergencyContactModal.useModal();
  const updateRider = useUpdateRider();
  const riderUser = getUser({ rider });

  const form = useAppForm({
    defaultValues: {
      emergencyContactName: rider.emergencyContactName ?? "",
      emergencyContactPhone: rider.emergencyContactPhone ?? "",
    },
    onSubmit: async ({ value }) => {
      await updateRider.mutateAsync(
        {
          riderId: rider.id,
          emergencyContactName: returnStringOrNull(value.emergencyContactName),
          emergencyContactPhone: returnStringOrNull(
            value.emergencyContactPhone
          ),
        },
        {
          onSuccess: () => {
            toast.success("Emergency contact updated successfully");
            modal.close();
          },
          onError: (error) => {
            toast.error(error.message);
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
      >
        <DialogHeader>
          <DialogTitle>Emergency Contact</DialogTitle>
          <DialogDescription className="text-xs">
            For: {riderUser.name}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form.AppField name="emergencyContactName">
            {(field) => (
              <field.TextField label="Name" placeholder="Enter name" />
            )}
          </form.AppField>
          <form.AppField name="emergencyContactPhone">
            {(field) => (
              <field.PhoneField label="Phone" placeholder="(123) 456-7890" />
            )}
          </form.AppField>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <form.AppForm>
            <form.SubmitButton label="Save" loadingLabel="Saving..." />
          </form.AppForm>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
