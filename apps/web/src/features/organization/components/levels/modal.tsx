import { useCreateLevel, useUpdateLevel, type Level } from "@instride/api";
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

interface LevelModalPayload {
  level?: Level;
}

export const levelModalHandler =
  DialogHandler.createHandle<LevelModalPayload | null>();

export function LevelModal() {
  return (
    <Dialog handle={levelModalHandler}>
      {({ payload }) => (
        <DialogPortal>
          <LevelModalForm {...payload} />
        </DialogPortal>
      )}
    </Dialog>
  );
}

export function LevelModalForm(props: LevelModalPayload) {
  const level = props?.level;
  const createLevel = useCreateLevel();
  const updateLevel = useUpdateLevel();

  const onSuccess = () => levelModalHandler.close();

  const form = useAppForm({
    defaultValues: {
      name: level?.name ?? "",
      description: level?.description,
      color: level?.color ?? "",
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().nullable(),
        color: z.string().min(1, "Color is required"),
      }),
    },
    onSubmit: async ({ value }) => {
      const description =
        value.description?.trim() === "" ? null : value.description;

      if (level) {
        await updateLevel.mutateAsync({
          id: level.id,
          ...value,
          description,
        });
      } else {
        await createLevel.mutateAsync(
          {
            name: value.name,
            color: value.color,
            description: description,
          },
          {
            onSuccess: () => {
              toast.success(
                level
                  ? "Level updated successfully"
                  : "Level created successfully"
              );
              levelModalHandler.close();
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
          <DialogTitle>{level ? "Edit" : "Create"} level</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <form.AppField
            name="name"
            children={(field) => (
              <field.TextField label="Name" placeholder="e.g. Beginner" />
            )}
          />
          <form.AppField
            name="color"
            children={(field) => <field.ColorPickerField label="Color" />}
          />
          <form.AppField
            name="description"
            children={(field) => (
              <field.TextareaField
                label="Description"
                placeholder="e.g. Beginner level for beginners"
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
              label={level ? "Save changes" : "Create level"}
              loadingLabel={level ? "Saving..." : "Creating..."}
            />
          </form.AppForm>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
