import { useUpdateCurrentUser } from "@instride/api";
import { toast } from "sonner";
import z from "zod";

import { Card, CardContent, CardFooter } from "@/shared/components/ui/card";
import { AvatarUpload } from "@/shared/components/ui/file-upload";
import { useAppForm } from "@/shared/hooks/use-form";

import { Route } from "./index";

enum FileUploadAction {
  NONE = "none",
  UPDATE = "update",
  DELETE = "delete",
}

export function PersonalDetails() {
  const { user } = Route.useRouteContext();
  const updateUser = useUpdateCurrentUser();

  const form = useAppForm({
    defaultValues: {
      name: user.name,
      email: user.email,
      image: user.image,
      dateOfBirth: user.dateOfBirth,
      newImage: null as File | null,
      imageAction: FileUploadAction.NONE,
      phone: user.phone,
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, { error: "Name is required" }),
        email: z.email({ error: "Invalid email address" }),
        image: z.string().nullable(),
        newImage: z.file().nullable(),
        imageAction: z.enum(FileUploadAction, {
          error: "Invalid file upload action",
        }),
        dateOfBirth: z.string().trim().min(1, "Date of birth is required"),
        phone: z.string().nullable(),
      }),
    },
    onSubmit: async ({ value }) => {
      await updateUser.mutateAsync(
        {
          name: value.name,
          image: value.image,
          dateOfBirth: value.dateOfBirth,
          phone: value.phone,
        },
        {
          onSuccess: () => {
            toast.success("Profile updated successfully");
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Card>
        <CardContent className="space-y-4">
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
            children={(field) => <field.TextField label="Name" />}
          />
          <form.AppField
            name="email"
            children={(field) => (
              <field.TextField label="Email" type="email" disabled />
            )}
          />
          <form.AppField
            name="phone"
            children={(field) => (
              <field.PhoneField label="Phone" placeholder="(123) 456-7890" />
            )}
          />
          <form.AppField
            name="dateOfBirth"
            children={(field) => (
              <field.DateField
                label="Date of birth"
                captionLayout="dropdown"
                valueFormat="M/dd/yyyy"
              />
            )}
          />
        </CardContent>
        <CardFooter className="flex w-full justify-end">
          <form.AppForm>
            <form.SubmitButton label="Save" loadingLabel="Saving..." />
          </form.AppForm>
        </CardFooter>
      </Card>
    </form>
  );
}
