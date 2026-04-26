import { useUpdateOrganization } from "@instride/api";
import z from "zod";

import { Card, CardContent, CardFooter } from "@/shared/components/ui/card";
import { FieldGroup, FieldSet } from "@/shared/components/ui/field";
import { useAppForm } from "@/shared/hooks/use-form";
import { states } from "@/shared/lib/states";

import { Route } from "./index";

export function OrganizationDetails() {
  const { organization } = Route.useRouteContext();
  const updateOrganization = useUpdateOrganization();

  const form = useAppForm({
    defaultValues: {
      name: organization.name,
      phone: organization.phone,
      website: organization.website,
      addressLine1: organization.addressLine1,
      addressLine2: organization.addressLine2,
      city: organization.city,
      state: organization.state,
      postalCode: organization.postalCode,
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, "Name is required"),
        phone: z.string().min(1, "Phone is required"),
        website: z.string().nullable(),
        addressLine1: z.string().min(1, "Address Line 1 is required"),
        addressLine2: z.string().nullable(),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        postalCode: z.string().min(1, "Postal Code is required"),
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
        <CardContent className="space-y-4">
          <form.AppField
            name="name"
            children={(field) => <field.TextField label="Name" />}
          />
          <form.AppField
            name="website"
            children={(field) => (
              <field.TextField
                label="Website"
                placeholder="https://example.com"
              />
            )}
          />
          <form.AppField
            name="phone"
            children={(field) => (
              <field.TextField label="Phone" placeholder="123-456-7890" />
            )}
          />
          <FieldSet>
            <FieldGroup>
              <form.AppField
                name="addressLine1"
                children={(field) => (
                  <field.TextField
                    label="Address Line 1"
                    placeholder="123 Main St"
                  />
                )}
              />
              <form.AppField
                name="addressLine2"
                children={(field) => (
                  <field.TextField label="Address Line 2" placeholder="Apt 1" />
                )}
              />
              <div className="flex gap-4">
                <form.AppField
                  name="city"
                  children={(field) => (
                    <field.TextField label="City" placeholder="Anytown" />
                  )}
                />
                <form.AppField
                  name="state"
                  children={(field) => (
                    <field.SelectField
                      label="State"
                      placeholder="IL"
                      className="w-fit"
                      items={states.map((state) => ({
                        label: state,
                        value: state,
                      }))}
                      itemToValue={(state) => state.value}
                      renderValue={(state) => state.label}
                    />
                  )}
                />
                <form.AppField
                  name="postalCode"
                  children={(field) => (
                    <field.TextField
                      label="Zip Code"
                      placeholder="60614"
                      className="w-[200px]"
                    />
                  )}
                />
              </div>
            </FieldGroup>
          </FieldSet>
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
