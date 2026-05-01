import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

import { defineModal } from "../lib/stores/modal.store";
import { Spinner } from "./ui/spinner";

export interface ConfirmationModalPayload<T = unknown> {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => T | Promise<T>;
}

export function ConfirmationModalComponent() {
  const { isOpen, payload, onOpenChange } = ConfirmationModal.useModal();
  const [isPending, setIsPending] = React.useState(false);

  const handleConfirm = async (e: React.MouseEvent) => {
    if (!payload) return;

    e.preventDefault();

    try {
      setIsPending(true);
      await payload.onConfirm();
      onOpenChange(false);
    } catch {
    } finally {
      setIsPending(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (isPending) return;
    onOpenChange(open);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      {payload && (
        <AlertDialogContent className="z-999">
          <AlertDialogHeader>
            <AlertDialogTitle>{payload.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {payload.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {payload.cancelLabel ?? "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
              {payload.confirmLabel ?? "Confirm"}
              {isPending && <Spinner />}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}

export const ConfirmationModal = defineModal<ConfirmationModalPayload>({
  id: "confirmation-modal",
  component: ConfirmationModalComponent,
});
