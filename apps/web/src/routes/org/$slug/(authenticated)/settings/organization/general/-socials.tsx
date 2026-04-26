import { useUpdateOrganization } from "@instride/api";
import { z } from "zod";

import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/shared/components/ui/brand-icons";
import { Card, CardContent, CardFooter } from "@/shared/components/ui/card";
import { InputGroupAddon } from "@/shared/components/ui/input-group";
import { useAppForm } from "@/shared/hooks/use-form";

import { Route } from "./index";

export function OrganizationSocialsCard() {
  const { organization } = Route.useRouteContext();
  const updateOrganization = useUpdateOrganization();

  const form = useAppForm({
    defaultValues: {
      facebook: organization.facebook,
      instagram: organization.instagram,
      youtube: organization.youtube,
      tiktok: organization.tiktok,
    },
    validators: {
      onSubmit: z.object({
        facebook: z.string().nullable(),
        instagram: z.string().nullable(),
        youtube: z.string().nullable(),
        tiktok: z.string().nullable(),
      }),
    },
    onSubmit: async ({ value }) => {
      await updateOrganization.mutateAsync({
        organizationId: organization.id,
        ...value,
      });
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
        <CardContent>
          <div className="grid gap-x-8 gap-y-4">
            <form.AppField
              name="facebook"
              children={(field) => (
                <field.TextField label="Facebook" inputGroup>
                  <InputGroupAddon>
                    <FacebookIcon />
                  </InputGroupAddon>
                </field.TextField>
              )}
            />
            <form.AppField
              name="instagram"
              children={(field) => (
                <field.TextField label="Instagram" inputGroup>
                  <InputGroupAddon>
                    <InstagramIcon />
                  </InputGroupAddon>
                </field.TextField>
              )}
            />
            <form.AppField
              name="youtube"
              children={(field) => (
                <field.TextField label="YouTube" inputGroup>
                  <InputGroupAddon>
                    <YouTubeIcon />
                  </InputGroupAddon>
                </field.TextField>
              )}
            />
            <form.AppField
              name="tiktok"
              children={(field) => (
                <field.TextField label="TikTok" inputGroup>
                  <InputGroupAddon>
                    <TikTokIcon />
                  </InputGroupAddon>
                </field.TextField>
              )}
            />
          </div>
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
