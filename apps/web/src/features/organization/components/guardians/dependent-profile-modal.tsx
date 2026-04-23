import type { types } from "@instride/api";
import { FileUploadAction } from "@instride/shared";
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
import { AvatarUpload } from "@/shared/components/ui/file-upload";
import { useAppForm } from "@/shared/hooks/use-form";

interface DependentProfileModalPayload {
  relationship: types.MyDependent;
}

export const editDependentProfileModalHandler =
  DialogHandler.createHandle<DependentProfileModalPayload>();

export function EditDependentProfileModal() {
  return (
    <Dialog handle={editDependentProfileModalHandler}>
      {({ payload }) => (
        <DialogPortal>
          {payload && (
            <DependentProfileForm relationship={payload.relationship} />
          )}
        </DialogPortal>
      )}
    </Dialog>
  );
}

export function DependentProfileForm({
  relationship,
}: DependentProfileModalPayload) {
  const form = useAppForm({
    defaultValues: {
      name: relationship.dependent.name ?? "",
      phone: relationship.dependent.phone ?? "",
      image: relationship.dependent.image ?? "",
      newImage: null as File | null,
      imageAction: FileUploadAction.NONE as FileUploadAction,
    },
    validators: {
      onSubmit: z.object({
        name: z.string(),
        phone: z.string(),
        image: z.string(),
        newImage: z.file().nullable(),
        imageAction: z.enum(FileUploadAction, {
          error: "Invalid file upload action",
        }),
      }),
    },
    onSubmit: ({ value }) => {
      // TODO: Update dependent profile
      console.log(value);
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
        className="space-y-4"
      >
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>
            Edit {relationship.dependent.name}'s Profile
          </DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <form.Field
            name="newImage"
            children={(field) => (
              <AvatarUpload
                shape="circle"
                size="lg"
                currentUrl={
                  field.state.value
                    ? URL.createObjectURL(field.state.value)
                    : null
                }
                onUpload={async (file) => {
                  field.handleChange(file);
                  return URL.createObjectURL(file);
                }}
                onRemove={async () => {
                  field.handleChange(null);
                }}
              />
            )}
          />
          <form.AppField
            name="name"
            children={(field) => (
              <field.TextField label="Name" placeholder="John Doe" />
            )}
          />
          <form.AppField
            name="phone"
            children={(field) => <field.PhoneField label="Phone" />}
          />
        </FieldGroup>
        <DialogFooter>
          <div className="w-full flex items-center justify-between gap-2">
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <form.AppForm>
              <form.SubmitButton label="Save" loadingLabel="Saving..." />
            </form.AppForm>
          </div>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
