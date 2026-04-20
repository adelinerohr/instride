import { FieldGroup } from "@/shared/components/ui/field";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { withFieldGroup } from "@/shared/hooks/use-form";
import { formatError } from "@/shared/lib/utils/errors";

import { defaultMemberOnboardingValues } from "../../lib/member/form";

export const WaiverStep = withFieldGroup({
  defaultValues: defaultMemberOnboardingValues.waiver,
  props: {
    waiverContent: "",
    name: "",
  },
  render: function Render({ group, waiverContent, name }) {
    return (
      <FieldGroup>
        <ScrollArea className="h-64 rounded-md border p-4 bg-muted text-muted-foreground">
          <div className="prose prose-sm max-w-none space-y-4 leading-relaxed">
            {waiverContent || "No waiver available."}
          </div>
        </ScrollArea>

        <FieldGroup>
          <group.AppField
            name="signedBy"
            validators={{
              onSubmit: ({ value }) => {
                if (!value || value.trim().length === 0) {
                  return formatError("Signature is required");
                }
                if (value.trim().toLowerCase() !== name.toLowerCase()) {
                  return formatError("Name does not match");
                }
              },
            }}
            children={(field) => (
              <field.TextField
                label="Signature"
                placeholder={name}
                description={`must match: ${name}`}
              />
            )}
          />
          <group.AppField
            name="termsAgreed"
            validators={{
              onSubmit: ({ value }) => {
                if (!value) {
                  return formatError("You must agree to the terms");
                }
              },
            }}
            children={(field) => (
              <field.CheckboxField label="I have read and agree to the terms and conditions of this waiver." />
            )}
          />
          <group.AppField
            name="signatureAcknowledgement"
            validators={{
              onSubmit: ({ value }) => {
                if (!value) {
                  return formatError("You must acknowledge your signature");
                }
              },
            }}
            children={(field) => (
              <field.CheckboxField label="I acknowledge that typing my name constitutes a legal electronic signature." />
            )}
          />
        </FieldGroup>
      </FieldGroup>
    );
  },
});
