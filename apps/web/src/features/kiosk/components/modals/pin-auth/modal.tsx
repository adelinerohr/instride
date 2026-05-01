import type { Member, Rider } from "@instride/api";
import type { KioskActionContext } from "@instride/shared";

import { Dialog, DialogPortal } from "@/shared/components/ui/dialog";
import { defineModal } from "@/shared/lib/stores/modal.store";

import { PinAuthModalForm } from "./form";

export interface PinAuthModalPayload {
  context: KioskActionContext;
  preselectedMemberId?: string;
  title?: string;
  description?: string;
  deniedMessage?: string;
  onAuthorized: (result: { member: Member; riderOptions: Rider[] }) => void;
}

export function PinAuthModalComponent() {
  const { isOpen, payload, onOpenChange } = PinAuthModal.useModal();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {payload && (
        <DialogPortal>
          <PinAuthModalForm {...payload} />
        </DialogPortal>
      )}
    </Dialog>
  );
}

export const PinAuthModal = defineModal<PinAuthModalPayload>({
  id: "pin-auth",
  component: PinAuthModalComponent,
});
