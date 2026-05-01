import type { Event } from "@instride/api";

import { Dialog, DialogPortal } from "@/shared/components/ui/dialog";
import { defineModal } from "@/shared/lib/stores/modal.store";

import { EventModalForm } from "./form";

export interface EventModalPayload {
  event?: Event;
}

export function EventModalComponent() {
  const { isOpen, payload, onOpenChange } = EventModal.useModal();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {payload && (
        <DialogPortal>
          <EventModalForm {...payload} />
        </DialogPortal>
      )}
    </Dialog>
  );
}

export const EventModal = defineModal<EventModalPayload>({
  id: "event",
  component: EventModalComponent,
});
