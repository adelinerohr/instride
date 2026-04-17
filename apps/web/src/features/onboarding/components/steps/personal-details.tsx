import { differenceInYears } from "date-fns";
import { CakeIcon } from "lucide-react";

import { FieldGroup } from "@/shared/components/ui/field";
import { AvatarUpload } from "@/shared/components/ui/file-upload";
import { withFieldGroup } from "@/shared/hooks/use-form";
import { formatError } from "@/shared/lib/utils/errors";

import { defaultMemberOnboardingValues } from "../../lib/member/form";
import { guardianInvitationModalHandler } from "../modals/guardian-invitation";

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
          validators={{
            onSubmit: ({ value }) => {
              if (!value || value.trim().length === 0) {
                return formatError("Name is required");
              }
              if (value.length > 64) {
                return formatError("Name must be less than 64 characters");
              }
            },
          }}
          children={(field) => (
            <field.TextField label="Name" placeholder="John Doe" required />
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

        <div className="grid grid-cols-2 gap-4">
          <group.AppField
            name="phone"
            children={(field) => (
              <field.PhoneField label="Phone" placeholder="(123) 456-7890" />
            )}
          />
          <group.AppField
            name="dateOfBirth"
            validators={{
              onSubmit: ({ value }) => {
                if (!value || value.trim().length === 0) {
                  return formatError("Date of birth is required");
                }

                const dob = new Date(value);
                const age = differenceInYears(new Date(), dob);

                if (age < 18) {
                  guardianInvitationModalHandler.open(null);
                  return formatError(
                    "You must be at least 18 years old to complete onboarding"
                  );
                }
              },
            }}
            children={(field) => (
              <field.DateField
                label="Date of Birth"
                valueFormat="M/d/yyyy"
                captionLayout="dropdown"
                icon={CakeIcon}
                required
              />
            )}
          />
        </div>
      </FieldGroup>
    );
  },
});
