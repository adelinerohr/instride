import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/shared/components/ui/field";
import { withFieldGroup } from "@/shared/hooks/use-form";

import { defaultDependentOnboardingValues } from "../../lib/dependent/form";

export const GuardianControlsStep = withFieldGroup({
  defaultValues: defaultDependentOnboardingValues.permissions,
  render: function Render({ group }) {
    return (
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Bookings</FieldLegend>
          <FieldDescription>
            Adjust the permissions for this dependent to manage their bookings
            and events.
          </FieldDescription>
          <group.AppField
            name="bookings.canBookLessons"
            children={(field) => <field.SwitchField label="Book lessons" />}
          />
          <group.AppField
            name="bookings.canJoinEvents"
            children={(field) => <field.SwitchField label="Join events" />}
          />
          <group.AppField
            name="bookings.requiresApproval"
            children={(field) => (
              <field.SwitchField label="Requires approval" />
            )}
          />
          <group.AppField
            name="bookings.canCancel"
            children={(field) => <field.SwitchField label="Cancel lessons" />}
          />
        </FieldSet>
        <FieldSeparator />
        <FieldSet>
          <FieldLegend>Communication</FieldLegend>
          <FieldDescription>
            Set how this dependent can interact with the social feed and receive
            alerts regarding their bookings and events.
          </FieldDescription>
          <group.AppField
            name="communication.canPost"
            children={(field) => (
              <field.SwitchField label="Post to community feed" />
            )}
          />
          <group.AppField
            name="communication.canComment"
            children={(field) => <field.SwitchField label="Comment on posts" />}
          />
          <group.AppField
            name="communication.receiveEmailNotifications"
            children={(field) => (
              <field.SwitchField label="Receive email notifications" />
            )}
          />
          <group.AppField
            name="communication.receiveTextNotifications"
            children={(field) => (
              <field.SwitchField label="Receive text notifications" />
            )}
          />
        </FieldSet>
        <FieldSeparator />
        <FieldSet>
          <FieldLegend>Profile</FieldLegend>
          <FieldDescription>
            Allow this dependent to edit their own profile.
          </FieldDescription>
          <group.AppField
            name="profile.canEdit"
            children={(field) => (
              <field.SwitchField label="Edit personal profile" />
            )}
          />
        </FieldSet>
      </FieldGroup>
    );
  },
});
