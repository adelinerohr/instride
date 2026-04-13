import { invitationOptions } from "@instride/api";
import { MembershipRole } from "@instride/shared";
import { useQueryClient } from "@tanstack/react-query";
import { isAPIError } from "better-auth/api";
import { toast } from "sonner";
import z from "zod";

import { Card, CardContent } from "@/shared/components/ui/card";
import { useAppForm } from "@/shared/hooks/form";
import { authClient } from "@/shared/lib/auth/client";

import { Route } from "./index";

export function InviteMember() {
  const { organization } = Route.useRouteContext();
  const queryClient = useQueryClient();

  const form = useAppForm({
    defaultValues: {
      email: "",
      role: [] as MembershipRole[],
    },
    validators: {
      onSubmit: z.object({
        email: z.email(),
        role: z.array(z.enum(MembershipRole)),
      }),
    },
    onSubmit: async ({ value }) => {
      await authClient.organization.inviteMember(
        {
          ...value,
          organizationId: organization.id,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: invitationOptions.list().queryKey,
            });
            toast.success("Invitation sent successfully");
            form.reset();
          },
          onError: (error) => {
            if (isAPIError(error)) {
              toast.error(error.message);
            } else {
              toast.error("Failed to send invitation");
            }
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
            name="role"
            children={(field) => (
              <field.MultiSelectField
                label="Role"
                placeholder="Select role(s)"
                items={Object.values(MembershipRole).map((role) => ({
                  label: role,
                  value: role,
                }))}
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
