import { getUser, type Rider } from "@instride/api";
import * as React from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { defineModal } from "@/shared/lib/stores/modal.store";

export interface RiderSelectPayload {
  title?: string;
  description?: string;
  riderOptions: Rider[];
  onSelected: (rider: Rider) => void;
}

export function RiderSelectModalComponent() {
  const { isOpen, payload, onOpenChange } = RiderSelectModal.useModal();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {payload && (
        <DialogPortal>
          <RiderSelectDialogContent {...payload} />
        </DialogPortal>
      )}
    </Dialog>
  );
}

export const RiderSelectModal = defineModal<RiderSelectPayload>({
  id: "rider-select",
  component: RiderSelectModalComponent,
});

function RiderSelectDialogContent(payload: RiderSelectPayload) {
  const modal = RiderSelectModal.useModal();
  const [selectedId, setSelectedId] = React.useState<string>(
    payload.riderOptions[0]?.id ?? ""
  );

  const handleConfirm = () => {
    const rider = payload.riderOptions.find((r) => r.id === selectedId);
    if (!rider) return;
    modal.close();
    payload.onSelected(rider);
  };

  return (
    <DialogContent zIndex={999}>
      <DialogHeader>
        <DialogTitle>{payload.title ?? "Select a rider"}</DialogTitle>
        {payload.description && (
          <DialogDescription>{payload.description}</DialogDescription>
        )}
      </DialogHeader>
      <DialogBody className="py-0">
        <RadioGroup value={selectedId} onValueChange={setSelectedId}>
          {payload.riderOptions.map((rider) => {
            const user = getUser({ rider });
            return (
              <div key={rider.id} className="flex items-center gap-3 py-2">
                <RadioGroupItem value={rider.id} id={`rider-${rider.id}`} />
                <Label htmlFor={`rider-${rider.id}`} className="cursor-pointer">
                  {user.name}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </DialogBody>

      <DialogFooter>
        <Button onClick={handleConfirm} disabled={!selectedId}>
          Continue
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
