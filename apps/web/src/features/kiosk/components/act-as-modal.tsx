import { APIError, ErrCode, useMembers } from "@instride/api";
import { getUser } from "@instride/shared";
import { REGEXP_ONLY_DIGITS } from "input-otp";
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
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/shared/components/ui/input-otp";
import { useAppForm } from "@/shared/hooks/use-form";

import { useKiosk } from "../hooks/use-kiosk";

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
        toast.success("You are now in an active session");
        actAsModalHandler.close();
      } catch (error) {
        if (error instanceof APIError) {
          const message =
            error.code === ErrCode.FailedPrecondition
              ? "You have not set a kiosk access PIN. Please login to your account and set a PIN."
              : error.code === ErrCode.PermissionDenied
                ? "Invalid PIN"
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
            <form.AppField
              name="memberId"
              children={(field) => (
                <field.SelectField
                  placeholder="Select your name"
                  items={members ?? []}
                  itemToValue={(member) => member.id}
                  renderValue={(member) => getUser({ member }).name}
                />
              )}
            />
            <form.Field
              name="pin"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Enter your PIN</FieldLabel>
                    <InputOTP
                      maxLength={4}
                      type="password"
                      value={field.state.value}
                      onChange={field.handleChange}
                      pattern={REGEXP_ONLY_DIGITS}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} aria-invalid={isInvalid} mask />
                        <InputOTPSlot index={1} aria-invalid={isInvalid} mask />
                        <InputOTPSlot index={2} aria-invalid={isInvalid} mask />
                        <InputOTPSlot index={3} aria-invalid={isInvalid} mask />
                      </InputOTPGroup>
                    </InputOTP>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
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
