import { useCreateWaiver, useUpdateWaiver, type Waiver } from "@instride/api";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHandler,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { FieldGroup } from "@/shared/components/ui/field";
import { useAppForm } from "@/shared/hooks/use-form";

interface WaiverModalPayload {
  waiver?: Waiver;
}

export const waiverModalHandler =
  DialogHandler.createHandle<WaiverModalPayload | null>();

export function WaiverModal() {
  return (
    <Dialog handle={waiverModalHandler}>
      {({ payload }) => (
        <DialogPortal>
          <WaiverModalForm {...payload} />
        </DialogPortal>
      )}
    </Dialog>
  );
}

export function WaiverModalForm(props: WaiverModalPayload | null) {
  const waiver = props?.waiver;
  const createWaiver = useCreateWaiver();
  const updateWaiver = useUpdateWaiver();

  const onSuccess = () => waiverModalHandler.close();

  const form = useAppForm({
    defaultValues: {
      title: waiver?.title ?? "",
      content: waiver?.content ?? "",
    },
    validators: {
      onSubmit: z.object({
        title: z.string().min(1, "Title is required"),
        content: z.string().min(1, "Content is required"),
      }),
    },
    onSubmit: async ({ value }) => {
      if (waiver) {
        await updateWaiver.mutateAsync({
          id: waiver.id,
          ...value,
        });
      } else {
        await createWaiver.mutateAsync(
          {
            ...value,
          },
          {
            onSuccess: () => {
              toast.success(
                waiver
                  ? "Waiver updated successfully"
                  : "Waiver created successfully"
              );
              waiverModalHandler.close();
              onSuccess();
            },
            onError: (error) => {
              toast.error(error.message);
            },
          }
        );
      }
    },
  });

  return (
    <DialogContent className="max-w-2xl!">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{waiver ? "Edit" : "Create"} waiver</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <form.AppField
            name="title"
            children={(field) => (
              <field.TextField
                label="Title"
                placeholder="e.g. General Liability Waiver"
              />
            )}
          />
          <form.AppField
            name="content"
            children={(field) => (
              <field.TextareaField
                label="Content"
                placeholder="Enter the full waiver text that riders will read and sign…"
                rows={10}
              />
            )}
          />
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <form.AppForm>
            <form.SubmitButton
              label={waiver ? "Save changes" : "Create waiver"}
              loadingLabel={waiver ? "Saving..." : "Creating..."}
            />
          </form.AppForm>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
