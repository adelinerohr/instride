import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHandler,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";

export const confirmationModalHandler = AlertDialogHandler.createHandle<{
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  discardLabel?: string;
  onConfirm: () => void;
  onDiscard?: () => void;
}>();

export function ConfirmationModal() {
  return (
    <AlertDialog handle={confirmationModalHandler}>
      {({ payload }) => {
        if (!payload) return null;

        const hasDiscard =
          payload.discardLabel !== undefined && payload.onDiscard !== undefined;

        return (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{payload.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {payload.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{payload.cancelLabel}</AlertDialogCancel>
              {hasDiscard && (
                <Button variant="outline" onClick={payload.onDiscard}>
                  {payload.discardLabel}
                </Button>
              )}
              <AlertDialogAction onClick={payload.onConfirm}>
                {payload.confirmLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        );
      }}
    </AlertDialog>
  );
}
