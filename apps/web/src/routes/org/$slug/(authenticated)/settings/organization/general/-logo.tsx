import { z } from "zod";

import { Card, CardContent } from "@/shared/components/ui/card";
import { AvatarUpload } from "@/shared/components/ui/file-upload";
import { useAppForm } from "@/shared/hooks/use-form";

import { Route } from "./index";

enum FileUploadAction {
  NONE = "none",
  UPDATE = "update",
  DELETE = "delete",
}

export function OrganizationLogoCard() {
  const { organization } = Route.useRouteContext();

  const form = useAppForm({
    defaultValues: {
      logoUrl: organization.logoUrl,
      newLogo: null as File | null,
      logoAction: FileUploadAction.NONE,
    },
    validators: {
      onSubmit: z.object({
        logoUrl: z.string().nullable(),
        newLogo: z.file().nullable(),
        logoAction: z.enum(FileUploadAction, {
          error: "Invalid file upload action",
        }),
      }),
    },
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  return (
    <Card>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="newLogo"
            children={(field) => (
              <AvatarUpload
                shape="square"
                size="lg"
                label="Upload logo"
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
        </form>
      </CardContent>
    </Card>
  );
}
