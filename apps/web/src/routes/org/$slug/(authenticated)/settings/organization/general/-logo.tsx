import { useDeleteLogo, useUploadLogo } from "@instride/api";
import { FileUploadAction } from "@instride/shared";
import { toast } from "sonner";
import { z } from "zod";

import { Card, CardContent, CardFooter } from "@/shared/components/ui/card";
import { AvatarUpload } from "@/shared/components/ui/file-upload";
import { useAppForm } from "@/shared/hooks/use-form";

import { Route } from "./index";

export function OrganizationLogoCard() {
  const { organization } = Route.useRouteContext();
  const uploadLogo = useUploadLogo();
  const deleteLogo = useDeleteLogo();

  const form = useAppForm({
    defaultValues: {
      logoUrl: organization.logoUrl,
      newLogo: null as File | null,
      logoAction: FileUploadAction.NONE as FileUploadAction,
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
    onSubmit: async ({ value }) => {
      switch (value.logoAction) {
        case FileUploadAction.UPDATE:
          if (!value.newLogo) {
            toast.error("No logo file selected");
            return;
          }

          const reader = new FileReader();
          reader.readAsDataURL(value.newLogo);
          const dataUrl = await new Promise<string>(
            (r) => (reader.onload = () => r(reader.result as string))
          );
          const data = dataUrl.split(",")[1];

          await uploadLogo.mutateAsync(
            {
              organizationId: organization.id,
              contentType: value.newLogo.type,
              data,
            },
            {
              onSuccess: () => {
                toast.success("Logo uploaded successfully");
              },
              onError: (error) => {
                toast.error(error.message);
              },
            }
          );

          return;
        case FileUploadAction.DELETE:
          if (value.logoUrl) {
            await deleteLogo.mutateAsync({ organizationId: organization.id });
          }
          return;
        default:
          return;
      }
    },
  });

  return (
    <Card>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <CardContent className="pb-4">
          <form.Subscribe
            selector={(state) => ({
              logoUrl: state.values.logoUrl,
              newLogo: state.values.newLogo,
            })}
          >
            {({ logoUrl, newLogo }) => {
              const previewUrl = newLogo
                ? URL.createObjectURL(newLogo)
                : logoUrl;

              return (
                <form.Field
                  name="newLogo"
                  children={(newLogoField) => (
                    <form.Field
                      name="logoAction"
                      children={(logoActionField) => (
                        <AvatarUpload
                          shape="square"
                          size="lg"
                          currentUrl={previewUrl}
                          onUpload={async (file) => {
                            newLogoField.handleChange(file);
                            logoActionField.handleChange(
                              FileUploadAction.UPDATE
                            );
                            return URL.createObjectURL(file);
                          }}
                          onRemove={async () => {
                            newLogoField.handleChange(null);
                            logoActionField.handleChange(
                              FileUploadAction.DELETE
                            );
                          }}
                        />
                      )}
                    />
                  )}
                />
              );
            }}
          </form.Subscribe>
        </CardContent>
        <CardFooter className="flex w-full justify-end">
          <form.AppForm>
            <form.SubmitButton label="Save" />
          </form.AppForm>
        </CardFooter>
      </form>
    </Card>
  );
}
