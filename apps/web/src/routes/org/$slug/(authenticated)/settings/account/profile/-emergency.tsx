import { useUpdateRider } from "@instride/api";
import { returnStringOrNull } from "@instride/shared";
import { toast } from "sonner";

import { Card, CardContent, CardFooter } from "@/shared/components/ui/card";
import { useAppForm } from "@/shared/hooks/use-form";

import { Route } from "./index";

export function EmergencyContact() {
  const { member } = Route.useRouteContext();
  const updateRider = useUpdateRider();

  const rider = member.rider;

  if (!rider) return null;

  const form = useAppForm({
    defaultValues: {
      emergencyContactName: rider.emergencyContactName ?? "",
      emergencyContactPhone: rider.emergencyContactPhone ?? "",
    },
    onSubmit: async ({ value }) => {
      await updateRider.mutateAsync(
        {
          riderId: rider.id,
          emergencyContactName: returnStringOrNull(value.emergencyContactName),
          emergencyContactPhone: returnStringOrNull(
            value.emergencyContactPhone
          ),
        },
        {
          onSuccess: () => {
            toast.success("Emergency contact updated successfully");
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Card>
        <CardContent className="space-y-4">
          <form.AppField name="emergencyContactName">
            {(field) => (
              <field.TextField label="Name" placeholder="Enter name" />
            )}
          </form.AppField>
          <form.AppField name="emergencyContactPhone">
            {(field) => (
              <field.PhoneField label="Phone" placeholder="(123) 456-7890" />
            )}
          </form.AppField>
        </CardContent>
        <CardFooter className="flex w-full justify-end">
          <form.AppForm>
            <form.SubmitButton label="Save" />
          </form.AppForm>
        </CardFooter>
      </Card>
    </form>
  );
}
