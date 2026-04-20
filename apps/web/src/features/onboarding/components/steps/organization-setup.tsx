import { useCheckSlug } from "@instride/api";
import { useStore } from "@tanstack/react-form";
import * as React from "react";

import { FieldGroup } from "@/shared/components/ui/field";
import {
  InputGroupAddon,
  InputGroupText,
} from "@/shared/components/ui/input-group";
import { withForm } from "@/shared/hooks/use-form";

import { organizationOnboardingFormOpts } from "../../lib/organization/form";

export const OrganizationSetupStep = withForm({
  ...organizationOnboardingFormOpts,
  render: ({ form }) => {
    const [checkSlug, setCheckSlug] = React.useState("");
    const slug = useStore(
      form.store,
      (state) => state.values.organizationSetup.slug
    );
    const { data: slugCheck, isLoading: isCheckingSlug } =
      useCheckSlug(checkSlug);

    const slugDescription =
      checkSlug.length > 0
        ? isCheckingSlug
          ? "Checking slug..."
          : slugCheck
            ? "Slug is available"
            : "Slug is not available"
        : "";

    return (
      <FieldGroup>
        <form.AppField
          name="organizationSetup.name"
          listeners={{
            onChange: ({ value }) => {
              const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
              form.setFieldValue("organizationSetup.slug", slug);
            },
            onBlur: () => setCheckSlug(slug),
          }}
          children={(field) => (
            <field.TextField
              label="Organization name"
              placeholder="Sunset Stables"
            />
          )}
        />
        <form.AppField
          name="organizationSetup.slug"
          listeners={{
            onBlur: ({ value }) => setCheckSlug(value),
          }}
          children={(field) => (
            <field.TextField
              label="Slug"
              placeholder="sunset-stables"
              description={slugDescription}
              inputGroup
              onChange={(e) => {
                const slugified = e.target.value
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")
                  .replace(/--+/g, "-");
                field.handleChange(slugified);
              }}
            >
              <InputGroupAddon align="inline-end">
                <InputGroupText>.instrideapp.com</InputGroupText>
              </InputGroupAddon>
            </field.TextField>
          )}
        />
        <form.AppField
          name="organizationSetup.timezone"
          children={(field) => (
            <field.SelectField
              label="Timezone"
              placeholder="Select timezone"
              items={[
                { label: "America/New_York", value: "America/New_York" },
                { label: "America/Chicago", value: "America/Chicago" },
                { label: "America/Denver", value: "America/Denver" },
                { label: "America/Los_Angeles", value: "America/Los_Angeles" },
                { label: "America/Anchorage", value: "America/Anchorage" },
                { label: "Pacific/Honolulu", value: "Pacific/Honolulu" },
              ]}
              itemToValue={(item) => item.value}
              renderValue={(value) => value.label}
              description="The timezone for your facility"
            />
          )}
        />
        <form.AppField
          name="organizationSetup.allowPublicJoin"
          children={(field) => (
            <field.SwitchField
              label="Allow public join"
              description="Allow users to join your organization without an invitation"
            />
          )}
        />
      </FieldGroup>
    );
  },
});
