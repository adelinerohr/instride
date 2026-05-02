import {
  useCreateLessonSeries,
  useRiders,
  useServices,
  type CreateLessonSeriesRequest,
} from "@instride/api";
import { returnStringOrNull } from "@instride/shared";
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

import { ContextPills } from "../../fragments/context-pills";
import { StepIndicator } from "../../fragments/step-indicator";
import { ConfirmStep } from "../steps/confirm-step";
import { DetailsStep } from "../steps/details-step";
import { RidersStep } from "../steps/riders-step";
import { ServiceStep } from "../steps/service-step";
import { TrainerStep } from "../steps/trainer-step";
import {
  AdminCreateLessonModal,
  type AdminCreateLessonModalPayload,
} from "./modal";

type StepKey = "riders" | "trainer" | "service" | "details" | "confirm";

export function AdminCreateLessonModalWizard({
  initialValues,
}: AdminCreateLessonModalPayload) {
  const modal = AdminCreateLessonModal.useModal();
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

  const { data: riders = [] } = useRiders();

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
      type: "admin",
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

      const payload: CreateLessonSeriesRequest = {
        ...value,
        start: startDate.toISOString(),
        duration: service.duration,
        maxRiders: service.maxRiders,
        name: returnStringOrNull(value.details?.name),
        levelId: returnStringOrNull(value.details?.levelId),
        notes: returnStringOrNull(value.details?.notes),
        isRecurring: value.details?.isRecurring ?? false,
      };

      await createLesson.mutateAsync(payload, {
        onSuccess: () => {
          toast.success("Lesson created successfully");
          modal.close();
        },
        onError: (error) => {
          toast.error(error.message);
        },
      });
    },
  });

  const selectedTrainerId = useStore(
    form.store,
    (state) => state.values.trainerId
  );

  const wizardSteps = React.useMemo(() => {
    const steps: WizardStepConfig<StepKey, keyof typeof form.fieldInfo>[] = [];
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
    steps.push({
      id: "riders",
      fields: ["riderIds"],
    });
    steps.push({
      id: "details",
      fields: ["details"],
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
    ? "You picked a day — pick a trainer, service, and riders to finish."
    : "You picked a slot — just a few details to finish.";

  const nextLabel = wizard.match({
    trainer: () => "Pick a service",
    service: () => "Add riders",
    riders: () => "Add details",
    details: () => "Review lesson",
    confirm: () => "Create lesson",
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
                riders: () => (
                  <RidersStep
                    form={form}
                    riders={eligibleRiders}
                    boardName={selectedBoard?.name ?? ""}
                    selectedTrainer={resolvedTrainer}
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
                    calendarCtx={calendarContext}
                  />
                ),
                details: () => (
                  <DetailsStep form={form} services={services ?? []} />
                ),
                confirm: () => (
                  <ConfirmStep
                    form={form}
                    eligibleRiders={eligibleRiders}
                    selectedTrainer={resolvedTrainer}
                    services={services ?? []}
                    timezone={organization.timezone}
                    startDate={startDate}
                    showRiderRow={wizard.steps.some((s) => s.id === "riders")}
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
                <form.SubmitButton label={nextLabel} icon={ArrowRightIcon} />
              </form.AppForm>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </WizardProvider>
  );
}
