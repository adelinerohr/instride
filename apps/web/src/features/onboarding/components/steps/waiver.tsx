import { FieldGroup } from "@/shared/components/ui/field";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { withFieldGroup } from "@/shared/hooks/form";

import { defaultMemberOnboardingValues } from "../../lib/member/form";

export const WaiverStep = withFieldGroup({
  defaultValues: defaultMemberOnboardingValues.waiver,
  props: {
    waiverContent: "",
  },
  render: function Render({ group, waiverContent }) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Liability Waiver</h2>
          <p className="mt-1 text-muted-foreground">
            Please read and sign the waiver to continue
          </p>
        </div>

        <ScrollArea className="h-64 rounded-md border p-4">
          <div className="prose prose-sm max-w-none space-y-4">
            {waiverContent}
          </div>
        </ScrollArea>

        <FieldGroup>
          <group.AppField
            name="signedBy"
            children={(field) => <field.TextField label="Name" />}
          />
          <group.AppField
            name="termsAgreed"
            children={(field) => (
              <field.CheckboxField
                label="Terms Agreed"
                description="I have read and agree to the terms and conditions of the waiver."
              />
            )}
          />
          <group.AppField
            name="signatureAcknowledgement"
            children={(field) => (
              <field.CheckboxField
                label="Signature Acknowledgement"
                description="I acknowledge that I have read and agree to the terms and conditions of the waiver."
              />
            )}
          />
        </FieldGroup>
      </div>
    );
  },
});
