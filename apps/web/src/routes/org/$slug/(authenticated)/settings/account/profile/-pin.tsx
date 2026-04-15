import { APIError, useSetPin } from "@instride/api";
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
  InputOTPSeparator,
  InputOTPSlot,
} from "@/shared/components/ui/input-otp";
import { useAppForm } from "@/shared/hooks/use-form";

export const setPinDialogHandler = DialogHandler.createHandle();

export function SetPinDialog() {
  const setPin = useSetPin();

  const form = useAppForm({
    defaultValues: {
      pin: "",
      confirmPin: "",
    },
    validators: {
      onSubmit: z
        .object({
          pin: z.string().min(4, "PIN must be 4 digits"),
          confirmPin: z.string().min(4, "Please confirm your PIN"),
        })
        .refine((data) => data.pin === data.confirmPin, {
          message: "PINs do not match",
          path: ["confirmPin"],
        }),
    },
    onSubmit: async ({ value }) => {
      await setPin.mutateAsync(value.pin, {
        onSuccess: () => {
          toast.success("Kiosk PIN set successfully");
          setPinDialogHandler.close();
        },
        onError: (error) => {
          toast.error(
            error instanceof APIError ? error.message : "Failed to set PIN"
          );
        },
      });
    },
  });

  return (
    <Dialog handle={setPinDialogHandler}>
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
              <DialogTitle>Set Kiosk PIN</DialogTitle>
              <DialogDescription>
                Create a 4-digit PIN to use when accessing kiosk mode. Keep this
                PIN secure.
              </DialogDescription>
            </DialogHeader>

            <form.Field
              name="pin"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Enter PIN</FieldLabel>
                    <InputOTP
                      maxLength={4}
                      value={field.state.value}
                      onChange={field.handleChange}
                      pattern={REGEXP_ONLY_DIGITS}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} mask />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={1} mask />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={2} mask />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} mask />
                      </InputOTPGroup>
                    </InputOTP>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            />

            <form.Field
              name="confirmPin"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Confirm PIN</FieldLabel>
                    <InputOTP
                      maxLength={4}
                      value={field.state.value}
                      onChange={field.handleChange}
                      pattern={REGEXP_ONLY_DIGITS}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} mask />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={1} mask />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={2} mask />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} mask />
                      </InputOTPGroup>
                    </InputOTP>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            />

            <DialogFooter>
              <form.AppForm>
                <form.SubmitButton label="Set PIN" loadingLabel="Setting..." />
              </form.AppForm>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
