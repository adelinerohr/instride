import { FieldGroup } from "@/shared/components/ui/field";
import { AvatarUpload } from "@/shared/components/ui/file-upload";
import { withFieldGroup } from "@/shared/hooks/form";

import { defaultMemberOnboardingValues } from "../../lib/member/form";

export const PersonalDetailsStep = withFieldGroup({
  defaultValues: defaultMemberOnboardingValues.personalDetails,
  render: function Render({ group }) {
    return (
      <FieldGroup>
        <div className="flex justify-center">
          <group.Field
            name="imageFile"
            children={(fileField) => (
              <group.Field
                name="image"
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
                      group.setFieldValue("removeImage", true);
                    }}
                  />
                )}
              />
            )}
          />
        </div>
        <group.AppField
          name="name"
          children={(field) => (
            <field.TextField label="Name" placeholder="John Doe" />
          )}
        />
        <group.AppField
          name="email"
          children={(field) => (
            <field.TextField
              label="Email"
              disabled
              placeholder="john.doe@example.com"
              type="email"
            />
          )}
        />
        <group.AppField
          name="phone"
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
