import { useCreateLessonSeries, useServices } from "@instride/api";
import { useStore } from "@tanstack/react-form";
import { useRouteContext } from "@tanstack/react-router";
import { parseISO } from "date-fns";
import { ArrowLeftIcon, ArrowRightIcon, SparklesIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { CalendarView } from "@/features/calendar/lib/types";
import {
  buildQuickCreateLessonDefaultValues,
  quickCreateLessonFormOpts,
} from "@/features/lessons/lib/quick-create.form";
import { Button } from "@/shared/components/ui/button";
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { WizardProvider } from "@/shared/contexts/wizard-context";
import { useAppForm } from "@/shared/hooks/use-form";
import { useWizard, type WizardStepConfig } from "@/shared/hooks/use-wizard";

import { ContextPills } from "../fragments/context-pills";
import { StepIndicator } from "../fragments/step-indicator";
import {
  RiderCreateLessonModal,
  type RiderCreateLessonModalPayload,
} from "./modal";
import { ConfirmStep } from "./steps/confirm-step";
import { RiderStep } from "./steps/rider-step";
import { ServiceStep } from "./steps/service-step";
import { TrainerStep } from "./steps/trainer-step";

type StepKey = "rider" | "trainer" | "service" | "confirm";

export function RiderCreateLessonModalWizard({
  initialValues,
  riders,
}: RiderCreateLessonModalPayload) {
  const modal = RiderCreateLessonModal.useModal();
  const calendarContext = useCalendar();
  const createLesson = useCreateLessonSeries();
  const { data: services } = useServices();
  const { organization } = useRouteContext({
    from: "/org/$slug/(authenticated)",
  });

  const startDate = React.useMemo(
    () => parseISO(initialValues.start),
    [initialValues.start]
  );

  const eligibleRiders = React.useMemo(
    () =>
      riders.filter((rider) =>
        rider.boardAssignments.some((a) => a.boardId === initialValues.boardId)
      ),
    [riders, initialValues.boardId]
  );

  const selectedBoard = React.useMemo(
    () => calendarContext.boards.find((b) => b.id === initialValues.boardId),
    [calendarContext.boards, initialValues.boardId]
  );

  const selectedTrainer = React.useMemo(
    () =>
      initialValues.trainerId
        ? calendarContext.trainers.find((t) => t.id === initialValues.trainerId)
        : undefined,
    [calendarContext.trainers, initialValues.trainerId]
  );

  const form = useAppForm({
    ...quickCreateLessonFormOpts,
    defaultValues: buildQuickCreateLessonDefaultValues({
      type: "rider",
      initialValues: {
        ...initialValues,
        riderId: eligibleRiders.length === 1 ? eligibleRiders[0].id : undefined,
      },
      timeZone: organization.timezone,
    }),
    onSubmit: async ({ value }) => {
      const service = services?.find((s) => s.id === value.serviceId);
      if (!service) {
        throw new Error("Service not found");
      }

      await createLesson.mutateAsync(
        {
          boardId: value.boardId,
          serviceId: value.serviceId,
          trainerId: value.trainerId,
          start: startDate.toISOString(),
          riderIds: value.riderIds,
          duration: service.duration,
          maxRiders: service.maxRiders,
        },
        {
          onSuccess: () => {
            toast.success("Lesson created successfully");
            modal.close();
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    },
  });

  const selectedRiderIds = useStore(
    form.store,
    (state) => state.values.riderIds
  );
  const selectedTrainerId = useStore(
    form.store,
    (state) => state.values.trainerId
  );

  const wizardSteps = React.useMemo(() => {
    const steps: WizardStepConfig<StepKey, keyof typeof form.fieldInfo>[] = [];
    if (riders.length > 1) {
      steps.push({
        id: "rider",
        fields: ["riderIds"],
      });
    }
    if (!initialValues.trainerId) {
      steps.push({
        id: "trainer",
        fields: ["trainerId"],
      });
    }
    steps.push({
      id: "service",
      fields: ["serviceId", "acknowledgePrivateLesson"],
    });
    steps.push({ id: "confirm" });
    return steps;
  }, [riders.length, initialValues.trainerId, form]);

  const wizard = useWizard({ steps: wizardSteps, form });

  const resolvedTrainer = React.useMemo(() => {
    if (selectedTrainer) return selectedTrainer;
    if (!selectedTrainerId) return undefined;
    return calendarContext.trainers.find((t) => t.id === selectedTrainerId);
  }, [selectedTrainer, selectedTrainerId, calendarContext.trainers]);

  const isWeekView =
    !initialValues.trainerId ||
    calendarContext.selectedView === CalendarView.WEEK;
  const headerSubtitle = isWeekView
    ? "You picked a day — pick a trainer and service to finish."
    : "You picked a slot — just a few details to finish.";

  const nextLabel = wizard.match({
    rider: () => (isWeekView ? "Pick a trainer" : "Pick a service"),
    trainer: () => "Pick a service",
    service: () => "Confirm booking",
    confirm: () => "Confirm booking",
  });

  return (
    <WizardProvider wizard={wizard}>
      <DialogContent className="sm:max-w-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (wizard.isLastStep) {
              form.handleSubmit();
            } else {
              wizard.next();
            }
          }}
          className="space-y-4"
        >
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                <SparklesIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <DialogTitle>Quick book</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {headerSubtitle}
                </p>
              </div>
            </div>
          </DialogHeader>

          <DialogBody>
            <ContextPills
              startDate={startDate}
              timezone={organization.timezone}
              boardName={selectedBoard?.name}
              trainer={resolvedTrainer}
              trainerPending={!resolvedTrainer}
            />

            <div className="min-h-[260px]">
              {wizard.match({
                rider: () => (
                  <RiderStep
                    form={form}
                    resolvedRiders={riders}
                    eligibleRiders={eligibleRiders}
                    boardName={selectedBoard?.name ?? ""}
                  />
                ),
                trainer: () => (
                  <TrainerStep
                    form={form}
                    board={selectedBoard}
                    startDate={startDate}
                    timezone={organization.timezone}
                    calendarCtx={calendarContext}
                    services={services ?? []}
                  />
                ),
                service: () => (
                  <ServiceStep
                    form={form}
                    board={selectedBoard}
                    services={services ?? []}
                    startDate={startDate}
                    timezone={organization.timezone}
                    riderLevelId={
                      eligibleRiders.find((r) => r.id === selectedRiderIds[0])
                        ?.ridingLevelId ?? null
                    }
                    calendarCtx={calendarContext}
                  />
                ),
                confirm: () => (
                  <ConfirmStep
                    form={form}
                    eligibleRiders={eligibleRiders}
                    selectedTrainer={resolvedTrainer}
                    services={services ?? []}
                    timezone={organization.timezone}
                    startDate={startDate}
                    showRiderRow={wizard.steps.some((s) => s.id === "rider")}
                  />
                ),
              })}
            </div>
          </DialogBody>
          <DialogFooter className="items-center sm:justify-between">
            <StepIndicator
              stepIndex={wizard.currentIndex}
              stepCount={wizard.steps.length}
            />
            <div className="flex items-center gap-2">
              {wizard.canGoBack && (
                <Button type="button" variant="ghost" onClick={wizard.back}>
                  <ArrowLeftIcon className="mr-1 h-4 w-4" />
                  Back
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                onClick={() => modal.close()}
              >
                Cancel
              </Button>
              <form.AppForm>
                <form.SubmitButton
                  label={nextLabel}
                  icon={ArrowRightIcon}
                ></form.SubmitButton>
              </form.AppForm>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </WizardProvider>
  );
}
