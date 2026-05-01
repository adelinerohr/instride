import { Dialog, DialogPortal } from "@/shared/components/ui/dialog";
import { defineModal } from "@/shared/lib/stores/modal.store";

import { AdminCreateLessonModalWizard } from "./wizard";

export interface AdminCreateLessonModalPayload {
  overrideAvailability?: boolean;
  initialValues: {
    start: string;
    boardId: string;
    trainerId?: string;
  };
}

export function AdminCreateLessonModalComponent() {
  const { isOpen, payload, onOpenChange } = AdminCreateLessonModal.useModal();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {payload && (
        <DialogPortal>
          <AdminCreateLessonModalWizard {...payload} />
        </DialogPortal>
      )}
    </Dialog>
  );
}

export const AdminCreateLessonModal =
  defineModal<AdminCreateLessonModalPayload>({
    id: "admin-create-lesson",
    component: AdminCreateLessonModalComponent,
  });
