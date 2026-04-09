import z from "zod";

import { Card, CardContent, CardFooter } from "@/shared/components/ui/card";
import { AvatarUpload } from "@/shared/components/ui/file-upload";
import { useAppForm } from "@/shared/hooks/form";

import { Route } from "./index";

enum FileUploadAction {
  NONE = "none",
  UPDATE = "update",
  DELETE = "delete",
}

export function PersonalDetails() {
  const { user } = Route.useRouteContext();

  const form = useAppForm({
    defaultValues: {
      name: user.name,
      email: user.email,
      image: user.image,
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
        phone: z.string().nullable(),
      }),
    },
    onSubmit: async ({ value }) => {
      console.log(value);
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
            children={(field) => <field.PhoneField label="Phone" />}
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
