import {
  APIError,
  ErrCode,
  useCheckKioskPermission,
  useMembers,
} from "@instride/api";
import * as React from "react";
import z from "zod";

import { useKiosk } from "@/features/kiosk/hooks/use-kiosk";
import {
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useAppForm } from "@/shared/hooks/use-form";

import { PinPickerFields } from "../../pin-fields";
import { PinAuthModal, type PinAuthModalPayload } from "./modal";

export function PinAuthModalForm(props: PinAuthModalPayload) {
  const { sessionId } = useKiosk();
  const { data: members } = useMembers();
  const modal = PinAuthModal.useModal();
  const checkPermission = useCheckKioskPermission();

  // Surfaces a non-form-error denial message above the picker (e.g., when
  // the verified user is not authorized for this action).
  const [deniedReason, setDeniedReason] = React.useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      memberId: props.preselectedMemberId ?? "",
      pin: "",
    },
    validators: {
      onSubmit: z.object({
        memberId: z.string().min(1, "Member is required"),
        pin: z.string().min(4, "PIN is required"),
      }),
    },
    onSubmit: async ({ value, formApi }) => {
      setDeniedReason(null);
      try {
        const result = await checkPermission.mutateAsync({
          sessionId,
          verification: { memberId: value.memberId, pin: value.pin },
          context: props.context,
        });
        formApi.reset();
        modal.close();
        props.onAuthorized({
          member: result.member,
          riderOptions: result.riderOptions,
        });
      } catch (error) {
        if (error instanceof APIError) {
          if (error.code === ErrCode.Unauthenticated) {
            // Bad PIN — surface as a form error, let them retry.
            formApi.setFieldMeta("pin", (prev) => ({
              ...prev,
              errorMap: { onSubmit: { message: "Invalid PIN" } },
            }));
            return;
          }
          if (error.code === ErrCode.PermissionDenied) {
            // Right PIN, wrong permission — show denied message above the form.
            setDeniedReason(
              props.deniedMessage ??
                error.message ??
                "You are not allowed to perform this action"
            );
            return;
          }
          if (error.code === ErrCode.FailedPrecondition) {
            formApi.setFieldMeta("pin", (prev) => ({
              ...prev,
              errorMap: {
                onSubmit: {
                  message:
                    "Member has not set a kiosk PIN. Please log in and set one.",
                },
              },
            }));
            return;
          }
        }
        formApi.setFieldMeta("pin", (prev) => ({
          ...prev,
          errorMap: {
            onSubmit: {
              message:
                error instanceof Error ? error.message : "An error occurred",
            },
          },
        }));
      }
    },
  });

  return (
    <DialogContent>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <DialogHeader>
          <DialogTitle>{props.title ?? "Select yourself"}</DialogTitle>
          <DialogDescription>
            {props.description ?? "Enter your PIN to authorize this action."}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {deniedReason && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {deniedReason}
            </div>
          )}

          <PinPickerFields
            form={form}
            fields={{ memberId: "memberId", pin: "pin" }}
            members={members ?? []}
          />
        </DialogBody>
        <DialogFooter>
          <form.AppForm>
            <form.SubmitButton label="Continue" loadingLabel="Verifying..." />
          </form.AppForm>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
