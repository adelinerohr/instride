import { Dialog, DialogPortal } from "@/shared/components/ui/dialog";
import { defineModal } from "@/shared/lib/stores/modal.store";

import { CreateTimeBlockForm } from "./form";

export interface CreateTimeBlockModalPayload {
  initialValues?: {
    start: string;
    trainerId?: string;
  };
  isOnlyTrainer?: boolean;
  trainerId?: string;
}

export function TimeBlockModalComponent() {
  const { isOpen, payload, onOpenChange } = CreateTimeBlockModal.useModal();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {payload && (
        <DialogPortal>
          <CreateTimeBlockForm {...payload} />
        </DialogPortal>
      )}
    </Dialog>
  );
}

export const CreateTimeBlockModal = defineModal<CreateTimeBlockModalPayload>({
  id: "create-time-block",
  component: TimeBlockModalComponent,
});
