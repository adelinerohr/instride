import type { Rider } from "@instride/api";

import { Dialog, DialogPortal } from "@/shared/components/ui/dialog";
import { defineModal } from "@/shared/lib/stores/modal.store";

import { RiderCreateLessonModalWizard } from "./wizard";

export interface RiderCreateLessonModalPayload {
  riders: Rider[];
  initialValues: {
    start: string;
    boardId: string;
    trainerId?: string;
  };
}

export function RiderCreateLessonModalComponent() {
  const { isOpen, payload, onOpenChange } = RiderCreateLessonModal.useModal();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {payload && (
        <DialogPortal>
          <RiderCreateLessonModalWizard {...payload} />
        </DialogPortal>
      )}
    </Dialog>
  );
}

export const RiderCreateLessonModal =
  defineModal<RiderCreateLessonModalPayload>({
    id: "rider-create-lesson",
    component: RiderCreateLessonModalComponent,
  });
