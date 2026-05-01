import { APIError, ErrCode, useMembers } from "@instride/api";
import { toast } from "sonner";
import z from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHandler,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useAppForm } from "@/shared/hooks/use-form";

import { useKiosk } from "../../hooks/use-kiosk";
import { PinPickerFields } from "../pin-fields";

export const actAsModalHandler = DialogHandler.createHandle();

export function ActAsModal() {
  const { startActing } = useKiosk();

  const { data: members } = useMembers();

  const form = useAppForm({
    defaultValues: {
      memberId: "",
      pin: "",
    },
    validators: {
      onSubmit: z.object({
        memberId: z.string().min(1, "Member is required"),
        pin: z.string().min(4, "PIN is required"),
      }),
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await startActing({
          memberId: value.memberId,
          pin: value.pin,
        });
        formApi.reset();
        toast.success("You are now in an active session");
        actAsModalHandler.close();
      } catch (error) {
        if (error instanceof APIError) {
          const message =
            error.code === ErrCode.FailedPrecondition
              ? "You have not set a kiosk access PIN. Please login to your account and set a PIN."
              : error.code === ErrCode.Unauthenticated
                ? "Invalid PIN"
                : error.code === ErrCode.PermissionDenied
                  ? (error.message ?? "Action not allowed")
                  : (error.message ?? "An error occurred");

          formApi.setFieldMeta("pin", (prev) => ({
            ...prev,
            errorMap: {
              onSubmit: {
                message,
              },
            },
          }));
        }
      }
    },
  });

  return (
    <Dialog handle={actAsModalHandler}>
      <DialogPortal>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle>Select yourself</DialogTitle>
              <DialogDescription>
                You will be acting as this member for the duration of your
                session.
              </DialogDescription>
            </DialogHeader>
            <PinPickerFields
              form={form}
              fields={{ memberId: "memberId", pin: "pin" }}
              members={members ?? []}
            />
            <DialogFooter>
              <form.AppForm>
                <form.SubmitButton
                  label="Continue"
                  loadingLabel="Verifying..."
                />
              </form.AppForm>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
