import { FieldGroup, FieldSet } from "@/shared/components/ui/field";
import { AvatarUpload } from "@/shared/components/ui/file-upload";
import { withForm } from "@/shared/hooks/use-form";
import { states } from "@/shared/lib/states";

import { organizationOnboardingFormOpts } from "../../lib/organization/form";

export const OrganizationDetailsStep = withForm({
  ...organizationOnboardingFormOpts,
  render: ({ form }) => {
    return (
      <FieldGroup>
        <form.Field
          name="organizationDetails.logoFile"
          children={(field) => (
            <AvatarUpload
              shape="square"
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
          name="organizationDetails.website"
          children={(field) => (
            <field.TextField
              label="Website"
              placeholder="https://example.com"
            />
          )}
        />
        <form.AppField
          name="organizationDetails.phone"
          children={(field) => (
            <field.TextField label="Phone" placeholder="123-456-7890" />
          )}
        />
        <FieldSet>
          <FieldGroup>
            <form.AppField
              name="organizationDetails.addressLine1"
              children={(field) => (
                <field.TextField
                  label="Address Line 1"
                  placeholder="123 Main St"
                />
              )}
            />
            <form.AppField
              name="organizationDetails.addressLine2"
              children={(field) => (
                <field.TextField label="Address Line 2" placeholder="Apt 1" />
              )}
            />
            <div className="flex gap-4">
              <form.AppField
                name="organizationDetails.city"
                children={(field) => (
                  <field.TextField label="City" placeholder="Anytown" />
                )}
              />
              <form.AppField
                name="organizationDetails.state"
                children={(field) => (
                  <field.SelectField
                    label="State"
                    placeholder="IL"
                    className="w-fit"
                    items={states.map((state) => ({
                      label: state,
                      value: state,
                    }))}
                    itemToValue={(item) => item.value}
                    renderValue={(value) => value.label}
                  />
                )}
              />
              <form.AppField
                name="organizationDetails.postalCode"
                children={(field) => (
                  <field.TextField
                    label="Zip Code"
                    placeholder="60614"
                    className="w-[150px]"
                  />
                )}
              />
            </div>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>
    );
  },
});
