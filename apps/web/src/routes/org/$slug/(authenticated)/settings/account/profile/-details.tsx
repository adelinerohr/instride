import { useUploadAvatar, useDeleteAvatar, useUpdateUser } from "@instride/api";
import { FileUploadAction } from "@instride/shared";
import { toast } from "sonner";
import { z } from "zod";

import { Card, CardContent, CardFooter } from "@/shared/components/ui/card";
import { AvatarUpload } from "@/shared/components/ui/file-upload";
import { useAppForm } from "@/shared/hooks/use-form";

import { Route } from "./index";

export function PersonalDetails() {
  const { user } = Route.useRouteContext();
  const updateUser = useUpdateUser();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();

  const form = useAppForm({
    defaultValues: {
      name: user.name,
      email: user.email,
      image: user.image,
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
      newImage: null as File | null,
      imageAction: FileUploadAction.NONE as FileUploadAction,
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
        dateOfBirth: z.date("Date of birth is required"),
        phone: z.string().nullable(),
      }),
    },
    onSubmit: async ({ value, formApi }) => {
      let imageUrl = value.image;

      switch (value.imageAction) {
        case FileUploadAction.UPDATE:
          if (!value.newImage) {
            toast.error("No image file selected");
            return;
          }
          const reader = new FileReader();
          reader.readAsDataURL(value.newImage);
          const dataUrl = await new Promise<string>(
            (r) => (reader.onload = () => r(reader.result as string))
          );
          const data = dataUrl.split(",")[1];

          await uploadAvatar.mutateAsync(
            {
              userId: user.id,
              contentType: value.newImage.type,
              data,
            },
            {
              onSuccess: () => {
                toast.success("Avatar uploaded successfully");
              },
              onError: (error) => {
                toast.error(error.message);
              },
            }
          );
          break;
        case FileUploadAction.DELETE:
          if (value.image) {
            await deleteAvatar.mutateAsync({ userId: user.id });
          }
          imageUrl = null;
          break;
        default:
          break;
      }

      await updateUser.mutateAsync(
        {
          name: value.name,
          dateOfBirth: value.dateOfBirth?.toISOString() ?? null,
          phone: value.phone,
        },
        {
          onSuccess: () => {
            formApi.reset({
              ...value,
              image: imageUrl,
              imageAction: FileUploadAction.NONE,
              newImage: null,
            });
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
          <form.Subscribe
            selector={(state) => ({
              image: state.values.image,
              newImage: state.values.newImage,
            })}
          >
            {({ image, newImage }) => {
              const previewUrl = newImage
                ? URL.createObjectURL(newImage)
                : image;

              return (
                <form.Field
                  name="newImage"
                  children={(newImageField) => (
                    <form.Field
                      name="imageAction"
                      children={(imageActionField) => (
                        <AvatarUpload
                          shape="circle"
                          size="lg"
                          currentUrl={previewUrl}
                          onUpload={async (file) => {
                            newImageField.handleChange(file);
                            imageActionField.handleChange(
                              FileUploadAction.UPDATE
                            );
                            return URL.createObjectURL(file);
                          }}
                          onRemove={async () => {
                            newImageField.handleChange(null);
                            imageActionField.handleChange(
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
            <form.SubmitButton label="Save" />
          </form.AppForm>
        </CardFooter>
      </Card>
    </form>
  );
}
