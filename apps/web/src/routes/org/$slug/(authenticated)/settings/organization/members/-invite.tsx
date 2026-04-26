import { useSendInvitation } from "@instride/api";
import { MembershipRole } from "@instride/shared";
import { toast } from "sonner";
import z from "zod";

import { Card, CardContent } from "@/shared/components/ui/card";
import { useAppForm } from "@/shared/hooks/use-form";

import { Route } from "./index";

export function InviteMember() {
  const { organization } = Route.useRouteContext();
  const sendInvitation = useSendInvitation();

  const form = useAppForm({
    defaultValues: {
      email: "",
      roles: [] as MembershipRole[],
    },
    validators: {
      onSubmit: z.object({
        email: z.email(),
        roles: z
          .array(z.enum(MembershipRole))
          .min(1, "Select at least one role"),
      }),
    },
    onSubmit: async ({ value }) => {
      sendInvitation.mutate(
        {
          organizationId: organization.id,
          email: value.email,
          roles: value.roles,
        },
        {
          onSuccess: () => {
            toast.success("Invitation sent successfully");
            form.reset();
          },
          onError: (error) => {
            toast.error(error.message ?? "Failed to send invitation");
          },
        }
      );
    },
  });

  return (
    <Card>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.AppField
            name="email"
            children={(field) => (
              <field.TextField label="Email" placeholder="member@example.com" />
            )}
          />
          <form.AppField
            name="roles"
            children={(field) => (
              <field.MultiSelectField
                label="Role"
                placeholder="Select role(s)"
                items={Object.values(MembershipRole).map((role) => ({
                  label: role,
                  value: role,
                }))}
                itemToValue={(item) => item.value}
                renderValue={(item) => item.label}
                itemToLabel={(item) => item.label}
              />
            )}
          />
          <form.AppForm>
            <form.SubmitButton
              label="Send Invitation"
              loadingLabel="Sending..."
            />
          </form.AppForm>
        </form>
      </CardContent>
    </Card>
  );
}
