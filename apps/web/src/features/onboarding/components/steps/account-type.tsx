import { UserIcon, UsersIcon } from "lucide-react";

import { FieldGroup } from "@/shared/components/ui/field";
import { withFieldGroup } from "@/shared/hooks/use-form";

import { defaultMemberOnboardingValues } from "../../lib/member/form";

export const AccountTypeStep = withFieldGroup({
  defaultValues: defaultMemberOnboardingValues.accountType,
  render: function Render({ group }) {
    return (
      <FieldGroup>
        <group.AppField
          name="isGuardian"
          listeners={{
            onChange: () => {
              group.setFieldValue("isRider", null);
            },
          }}
          children={(field) => (
            <field.ChoiceCardField
              label="Are you a parent or guardian?"
              isBoolean
              options={[
                {
                  label: "Just Me",
                  description: "I'm signing up for myself",
                  icon: UserIcon,
                  value: false,
                },
                {
                  label: "Parent/Guardian",
                  description: "I'm managing for dependents",
                  icon: UsersIcon,
                  value: true,
                },
              ]}
            />
          )}
        />

        <group.Subscribe selector={(state) => state.values.isGuardian}>
          {(isGuardian) =>
            isGuardian && (
              <group.AppField
                name="isRider"
                children={(field) => (
                  <field.ChoiceCardField
                    label="Will you also be riding?"
                    isBoolean
                    options={[
                      {
                        label: "Yes",
                        description: "I'll ride and manage dependents",
                        value: true,
                      },
                      {
                        label: "No",
                        description: "I'm only managing dependents",
                        value: false,
                      },
                    ]}
                  />
                )}
              />
            )
          }
        </group.Subscribe>
      </FieldGroup>
    );
  },
});
