import {
  boardsOptions,
  businessHoursOptions,
  useResetTrainerBusinessHours,
  useUpdateTrainer,
} from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

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
  CardTitle,
} from "@/shared/components/ui/card";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Separator } from "@/shared/components/ui/separator";
import { Switch } from "@/shared/components/ui/switch";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/settings/account/availability"
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    if (!context.member.trainer) {
      throw redirect({
        to: "/org/$slug/settings/account/profile",
        params: { slug: params.slug },
      });
    }

    const trainer = context.member.trainer;

    await context.queryClient.ensureQueryData(
      businessHoursOptions.trainer(trainer.id)
    );
    await context.queryClient.ensureQueryData(
      businessHoursOptions.organization()
    );
    await context.queryClient.ensureQueryData(boardsOptions.list());

    return { trainer };
  },
});

function RouteComponent() {
  const { trainer } = Route.useLoaderData();

  const { data: availability } = useSuspenseQuery(
    businessHoursOptions.trainer(trainer.id)
  );
  const { data: orgAvailability } = useSuspenseQuery(
    businessHoursOptions.organization()
  );
  const resetBoard = useResetTrainerBusinessHours({ trainerId: trainer.id });
  const updateTrainer = useUpdateTrainer();

  return (
    <AnnotatedLayout>
      <AnnotatedSection
        title="Trainer availability"
        description="Set your trainer's availability. Boards can inherit these defaults or set their own."
      >
        <div className="space-y-6 max-w-2xl">
          <BusinessHoursTabs
            defaultsLabel="Trainer Defaults"
            defaultsDescription="These hours apply to all boards."
            availability={availability}
            orgAvailability={orgAvailability}
            onResetBoard={async (boardId) =>
              await resetBoard.mutateAsync({ boardId })
            }
          >
            {({ boardId, effectiveHours }) => (
              <BusinessHoursForm
                type="trainer"
                boardId={boardId}
                existing={effectiveHours}
                trainerId={trainer.id}
                orgHours={orgAvailability.defaults}
              />
            )}
          </BusinessHoursTabs>
        </div>
      </AnnotatedSection>
      <Separator />
      <AnnotatedSection
        title="Trainer preferences"
        description="Set your preferences as a trainer."
      >
        <Card>
          <CardHeader>
            <CardTitle>Trainer Preferences</CardTitle>
            <CardDescription>
              These preferences apply to all boards.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="allowSameDayBookings">
                Allow same day bookings
              </FieldLabel>
              <Switch
                id="allowSameDayBookings"
                checked={trainer.allowSameDayBookings}
                onCheckedChange={(value) =>
                  updateTrainer.mutateAsync({
                    trainerId: trainer.id,
                    allowSameDayBookings: value,
                  })
                }
              />
            </Field>
          </CardContent>
        </Card>
      </AnnotatedSection>
    </AnnotatedLayout>
  );
}
