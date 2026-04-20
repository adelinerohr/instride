import {
  boardsOptions,
  businessHoursOptions,
  useResetTrainerBusinessHours,
  useUpdateTrainer,
} from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { RotateCcwIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { BusinessHoursForm } from "@/features/organization/components/business-hours/form";
import { confirmationModalHandler } from "@/shared/components/confirmation-modal";
import {
  AnnotatedLayout,
  AnnotatedSection,
} from "@/shared/components/layout/annotated";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

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
  const { data: boards } = useSuspenseQuery(boardsOptions.list());

  const resetBoard = useResetTrainerBusinessHours({ trainerId: trainer.id });
  const updateTrainer = useUpdateTrainer();

  const [activeTab, setActiveTab] = React.useState<"defaults" | string>(
    "defaults"
  );

  return (
    <AnnotatedLayout>
      <AnnotatedSection
        title="Trainer availability"
        description="Set your trainer's availability. Boards can inherit these defaults or set their own."
      >
        <div className="space-y-6 max-w-2xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="defaults">Trainer Defaults</TabsTrigger>
              {boards.map((board) => (
                <TabsTrigger key={board.id} value={board.id}>
                  {board.name}
                  {availability.boardOverrides[board.id]?.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 text-xs">
                      Custom
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Org-wide defaults */}
            <TabsContent value="defaults">
              <Card>
                <CardHeader>
                  <CardTitle>Trainer Defaults</CardTitle>
                  <CardDescription>
                    These hours apply to all boards.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BusinessHoursForm
                    type="trainer"
                    boardId={null}
                    existing={availability.defaults}
                    trainerId={trainer.id}
                    orgHours={orgAvailability.defaults}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Per-board overrides */}
            {boards.map((board) => {
              const boardHours = availability.boardOverrides[board.id] ?? [];
              const hasOverride = boardHours.length > 0;
              const effectiveHours = hasOverride
                ? boardHours
                : availability.defaults;

              // Resolve org hours for this board: use the board override when
              // present, else fall back to org defaults.
              const orgHoursForBoard =
                orgAvailability.boardOverrides[board.id] &&
                orgAvailability.boardOverrides[board.id].length > 0
                  ? orgAvailability.boardOverrides[board.id]
                  : orgAvailability.defaults;

              return (
                <TabsContent key={board.id} value={board.id}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{board.name}</CardTitle>
                          <CardDescription>
                            {hasOverride
                              ? "This board has custom hours."
                              : "Using organization defaults."}
                          </CardDescription>
                        </div>
                        {hasOverride && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              confirmationModalHandler.openWithPayload({
                                title: "Reset to organization defaults?",
                                description:
                                  "This will remove the custom hours for this board and fall back to the organization-wide defaults. This cannot be undone.",
                                onConfirm: () => {
                                  resetBoard.mutateAsync({ boardId: board.id });
                                  setActiveTab("defaults");
                                  toast.success(
                                    "Board hours reset to organization defaults"
                                  );
                                },
                                confirmLabel: "Reset",
                                cancelLabel: "Cancel",
                              })
                            }
                          >
                            <RotateCcwIcon className="h-3.5 w-3.5 mr-1.5" />
                            Reset to defaults
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <BusinessHoursForm
                        type="trainer"
                        boardId={board.id}
                        existing={effectiveHours}
                        trainerId={trainer.id}
                        orgHours={orgHoursForBoard}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
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
                    request: {
                      allowSameDayBookings: value,
                    },
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
