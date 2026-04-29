import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHandler,
  AlertDialogHeader,
  AlertDialogPortal,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

export const guardianInvitationModalHandler = AlertDialogHandler.createHandle();

export function GuardianInvitationModal() {
  return (
    <AlertDialog handle={guardianInvitationModalHandler}>
      <AlertDialogPortal>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Guardian Required</AlertDialogTitle>
            <AlertDialogDescription>
              You must be 18 or older to complete registration on your own.
              Please have your parent/guardian complete registration first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={guardianInvitationModalHandler.close}>
              I understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
}
