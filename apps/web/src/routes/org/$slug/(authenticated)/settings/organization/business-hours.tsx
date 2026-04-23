import {
  boardsOptions,
  businessHoursOptions,
  organizationOptions,
  useResetOrganizationBusinessHours,
  useUpdateOrganization,
} from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { BusinessHoursForm } from "@/features/organization/components/business-hours/form";
import { BusinessHoursTabs } from "@/features/organization/components/business-hours/tabs";
import {
  AnnotatedLayout,
  AnnotatedSection,
} from "@/shared/components/layout/annotated";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/shared/components/ui/card";
import { FieldLabel } from "@/shared/components/ui/field";
import { Field } from "@/shared/components/ui/field";
import { Separator } from "@/shared/components/ui/separator";
import { Switch } from "@/shared/components/ui/switch";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/settings/organization/business-hours"
)({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      businessHoursOptions.organization()
    );
    await context.queryClient.ensureQueryData(boardsOptions.list());
    await context.queryClient.ensureQueryData(
      organizationOptions.byId(context.organization.id)
    );
  },
});

function RouteComponent() {
  const context = Route.useRouteContext();
  const { data: organization } = useSuspenseQuery(
    organizationOptions.byId(context.organization.id)
  );
  const updateOrganization = useUpdateOrganization();

  const { data: availability } = useSuspenseQuery(
    businessHoursOptions.organization()
  );
  const resetBoard = useResetOrganizationBusinessHours();

  return (
    <AnnotatedLayout>
      <AnnotatedSection
        title="Organization business hours"
        description="Set your organization's operating hours. Boards can inherit these defaults or set their own. Each day can have multiple open windows."
      >
        <div className="space-y-6 max-w-2xl">
          <BusinessHoursTabs
            defaultsLabel="Organization Defaults"
            defaultsDescription="These hours apply to all boards unless overridden."
            availability={availability}
            onResetBoard={async (boardId) =>
              await resetBoard.mutateAsync({ boardId })
            }
          >
            {({ boardId, effectiveHours }) => (
              <BusinessHoursForm
                type="organization"
                existing={effectiveHours}
                boardId={boardId}
              />
            )}
          </BusinessHoursTabs>
        </div>
      </AnnotatedSection>
      <Separator />
      <AnnotatedSection
        title="Organization preferences"
        description="Set your preferences as an organization."
      >
        <Card>
          <CardHeader>
            <CardDescription>
              These preferences apply to all organization staff Members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="allowSameDayBookings">
                Allow same day bookings
              </FieldLabel>
              <Switch
                id="allowSameDayBookings"
                checked={organization.allowSameDayBookings}
                onCheckedChange={(value) =>
                  updateOrganization.mutateAsync(
                    {
                      organizationId: organization.id,
                      request: {
                        allowSameDayBookings: value,
                      },
                    },
                    {
                      onSuccess: () => {
                        toast.success("Organization preferences updated");
                      },
                      onError: (error) => {
                        toast.error(error.message);
                      },
                    }
                  )
                }
              />
            </Field>
          </CardContent>
        </Card>
      </AnnotatedSection>
    </AnnotatedLayout>
  );
}
