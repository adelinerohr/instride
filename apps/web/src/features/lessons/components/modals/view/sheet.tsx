import { Sheet } from "@/shared/components/ui/sheet";
import { defineModal } from "@/shared/lib/stores/modal.store";

import { ViewLessonContent } from "./content";

export interface ViewLessonSheetPayload {
  instanceId: string;
  isKiosk?: boolean;
}

export function ViewLessonSheetComponent() {
  const { isOpen, payload, onOpenChange } = ViewLessonSheet.useModal();

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      {payload && <ViewLessonContent {...payload} />}
    </Sheet>
  );
}

export const ViewLessonSheet = defineModal<ViewLessonSheetPayload>({
  id: "view-lesson-sheet",
  component: ViewLessonSheetComponent,
});
