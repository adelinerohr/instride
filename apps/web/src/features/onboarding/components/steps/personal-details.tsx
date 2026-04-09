import { FieldGroup } from "@/shared/components/ui/field";
import { AvatarUpload } from "@/shared/components/ui/file-upload";
import { withForm } from "@/shared/hooks/form";

import { organizationOnboardingFormOpts } from "../../lib/organization/form";

export const PersonalDetailsStep = withForm({
  ...organizationOnboardingFormOpts,
  render: ({ form }) => {
    return (
      <FieldGroup>
        <div className="flex justify-center">
          <form.Field
            name="personalDetails.imageFile"
            children={(fileField) => (
              <form.Field
                name="personalDetails.image"
                children={(field) => (
                  <AvatarUpload
                    shape="circle"
                    size="lg"
                    currentUrl={
                      fileField.state.value
                        ? URL.createObjectURL(fileField.state.value)
                        : field.state.value
                    }
                    onUpload={async (file) => {
                      fileField.handleChange(file);
                      field.handleChange(null);
                      return URL.createObjectURL(file);
                    }}
                    onRemove={async () => {
                      fileField.handleChange(null);
                      field.handleChange(null);
                      form.setFieldValue("personalDetails.removeImage", true);
                    }}
                  />
                )}
              />
            )}
          />
        </div>
        <form.AppField
          name="personalDetails.name"
          children={(field) => (
            <field.TextField label="Name" placeholder="John Doe" />
          )}
        />
        <form.AppField
          name="personalDetails.email"
          children={(field) => (
            <field.TextField
              label="Email"
              disabled
              placeholder="john.doe@example.com"
              type="email"
            />
          )}
        />
        <form.AppField
          name="personalDetails.phone"
          children={(field) => (
            <field.TextField
              label="Phone"
              placeholder="123-456-7890"
              type="tel"
            />
          )}
        />
      </FieldGroup>
    );
  },
});
