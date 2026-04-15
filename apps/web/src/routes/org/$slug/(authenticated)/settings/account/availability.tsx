import {
  boardsOptions,
  businessHoursOptions,
  useResetTrainerBusinessHours,
  useUpdateTrainer,
  useUpsertTrainerBusinessHours,
  type types,
} from "@instride/api";
import { availabilityDaysFormSchema, DayOfWeek } from "@instride/shared";
import {
  buildEmptyWeek,
  normalizeTimeSlot,
  type DayHours,
} from "@instride/utils";
import type { FormValidateOrFn } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { RotateCcwIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { DayRow } from "@/features/organization/components/business-hours/day-row";
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
import { Switch } from "@/shared/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { useAppForm } from "@/shared/hooks/use-form";

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
    await context.queryClient.ensureQueryData(boardsOptions.list());

    return { trainer };
  },
});

function RouteComponent() {
  const { trainer } = Route.useLoaderData();

  const { data: availability } = useSuspenseQuery(
    businessHoursOptions.trainer(trainer.id)
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
                  <TrainerBusinessHoursForm
                    boardId={null}
                    existing={availability.defaults}
                    trainerId={trainer.id}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Per-board overrides */}
            {boards.map((board) => {
              const boardHours = availability.boardOverrides[board.id] ?? [];
              const hasOverride = boardHours.length > 0;
              // Fall back to org defaults when no override
              const effectiveHours = hasOverride
                ? boardHours
                : availability.defaults;

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
                      <TrainerBusinessHoursForm
                        boardId={board.id}
                        existing={effectiveHours}
                        trainerId={trainer.id}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </AnnotatedSection>
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

interface TrainerBusinessHoursFormProps {
  trainerId: string;
  /** Existing saved rows to pre-populate (7 days, one row per day when present) */
  existing: (types.TrainerBusinessHours | types.OrganizationBusinessHours)[];
  boardId: string | null;
}

export function TrainerBusinessHoursForm({
  trainerId,
  existing,
  boardId,
}: TrainerBusinessHoursFormProps) {
  const upsert = useUpsertTrainerBusinessHours({ trainerId });

  const initialDays: DayHours[] = Object.values(DayOfWeek).map((dow) => {
    const saved = existing.find((r) => r.dayOfWeek === dow);
    if (saved) {
      return {
        dayOfWeek: dow as DayOfWeek,
        isOpen: saved.isOpen,
        openTime:
          saved.isOpen && saved.openTime != null
            ? normalizeTimeSlot(saved.openTime, "09:00")
            : saved.openTime,
        closeTime:
          saved.isOpen && saved.closeTime != null
            ? normalizeTimeSlot(saved.closeTime, "17:00")
            : saved.closeTime,
      };
    }
    return buildEmptyWeek().find((d) => d.dayOfWeek === dow)!;
  });

  const form = useAppForm({
    defaultValues: { days: initialDays },
    // Without this, handleSubmit can bail before running validators when
    // `canSubmit` is false (e.g. first click after fields become "invalid").
    canSubmitWhenInvalid: true,
    validators: {
      onSubmit: availabilityDaysFormSchema as FormValidateOrFn<{
        days: DayHours[];
      }>,
    },
    onSubmitInvalid: ({ formApi }) => {
      const first = formApi.state.errors[0];
      toast.error(
        typeof first === "string"
          ? first
          : "Please fix the highlighted fields and try again."
      );
    },
    onSubmit: async ({ value }) => {
      try {
        await upsert.mutateAsync(
          {
            trainerId,
            request: {
              boardId,
              days: value.days.map((day) => ({
                ...day,
                inheritsFromOrg: false,
              })),
            },
          },
          {
            onSuccess: () => {
              toast.success("Availability saved");
            },
            onError: () => {
              toast.error("Failed to save availability");
            },
          }
        );
      } catch {
        // Errors are surfaced via onError above
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field name="days" mode="array">
        {(field) => (
          <div className="rounded-md border">
            {([0, 1, 2, 3, 4, 5, 6] as const).map((i) => (
              <DayRow
                key={field.state.value[i].dayOfWeek}
                form={form}
                fields={`days[${i}]`}
              />
            ))}
          </div>
        )}
      </form.Field>

      <div className="flex justify-end">
        <form.AppForm>
          <form.SubmitButton label="Save hours" loadingLabel="Saving…" />
        </form.AppForm>
      </div>
    </form>
  );
}
