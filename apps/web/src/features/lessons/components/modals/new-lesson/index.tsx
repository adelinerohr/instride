import {
  boardsOptions,
  levelOptions,
  membersOptions,
  servicesOptions,
  useCancelLessonInstance,
  useCancelLessonSeries,
  useCreateLessonSeries,
  useUpdateLessonInstance,
  useUpdateLessonSeries,
  type types,
} from "@instride/api";
import { lessonSeriesInputSchema, RecurrenceFrequency } from "@instride/shared";
import { useStore } from "@tanstack/react-form";
import { useQueries } from "@tanstack/react-query";
import { TrashIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import {
  buildLessonDefaultValues,
  lessonFormOpts,
} from "@/features/lessons/lib/new-lesson.form";
import { confirmationModalHandler } from "@/shared/components/confirmation-modal";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogHandler,
  DialogPortal,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Field } from "@/shared/components/ui/field";
import { Label } from "@/shared/components/ui/label";
import { useAppForm } from "@/shared/hooks/use-form";

import { DetailsSection } from "./details";
import { RidersSection } from "./riders";
import { SchedulingSection } from "./scheduling";

interface LessonModalPayload {
  lesson?: types.LessonInstance;
  start?: string;
  boardId?: string;
  trainerId?: string;
  overrideBusinessHours?: boolean;
}

export const lessonModalHandler =
  DialogHandler.createHandle<LessonModalPayload>();

export function LessonModal() {
  return (
    <Dialog handle={lessonModalHandler}>
      {({ payload }) => (
        <DialogPortal>
          {payload && <LessonModalForm {...payload} />}
        </DialogPortal>
      )}
    </Dialog>
  );
}

export function LessonModalForm(initialValues: LessonModalPayload) {
  const createLessonSeries = useCreateLessonSeries();
  const updateLessonSeries = useUpdateLessonSeries();
  const updateLessonInstance = useUpdateLessonInstance();
  const cancelLessonInstance = useCancelLessonInstance();
  const cancelLessonSeries = useCancelLessonSeries();

  const [openSection, setOpenSection] = React.useState<
    "scheduling" | "details" | "riders" | null
  >("scheduling");

  const [saveFuture, setSaveFuture] = React.useState(false);

  const form = useAppForm({
    ...lessonFormOpts,
    defaultValues: buildLessonDefaultValues(initialValues),
    onSubmitInvalid: ({ formApi, value }) => {
      const formValues = value ?? formApi.state.values;
      // TanStack often stores issues as objects, not strings — use Zod for readable messages
      const parsed = lessonSeriesInputSchema.safeParse(formValues);
      if (!parsed.success) {
        const lines = parsed.error.issues.map((issue) => {
          const path = issue.path.length > 0 ? issue.path.join(".") : "(form)";
          return `${path}: ${issue.message}`;
        });
        toast.error(lines[0] ?? "Validation failed", {
          description:
            lines.length > 1 ? lines.slice(1, 5).join(" · ") : undefined,
        });
        if (import.meta.env.DEV) {
          console.error("[Lesson form] submit invalid", {
            zodIssues: parsed.error.issues,
            values: formValues,
          });
        }
        return;
      }

      const metaMessages: string[] = [];
      for (const [key, m] of Object.entries(formApi.state.fieldMeta ?? {})) {
        const errs = m?.errors;
        if (!errs?.length) continue;
        for (const e of errs) {
          const msg =
            typeof e === "string"
              ? e
              : e != null && typeof e === "object" && "message" in e
                ? String((e as { message: unknown }).message)
                : JSON.stringify(e);
          metaMessages.push(`${key}: ${msg}`);
        }
      }
      if (import.meta.env.DEV) {
        console.error(
          "[Lesson form] submit invalid; Zod passed — TanStack/StandardSchema mismatch?",
          {
            fieldMeta: formApi.state.fieldMeta,
            values: formValues,
            metaMessages,
          }
        );
      }
      toast.error(metaMessages[0] ?? "Please complete all required fields.", {
        description:
          metaMessages.length > 1
            ? metaMessages.slice(1, 4).join(" · ")
            : undefined,
      });
    },
    onSubmit: ({ value }) => {
      const onSuccess = () => {
        toast.success(
          initialValues.lesson
            ? "Lesson updated successfully"
            : "Lesson created successfully"
        );
        lessonModalHandler.close();
      };

      const onError = () => {
        toast.error("Failed to update lesson");
      };

      if (initialValues.lesson) {
        if (saveFuture && value.isRecurring) {
          updateLessonSeries.mutateAsync(
            {
              seriesId: initialValues.lesson.seriesId,
              request: {
                ...value,
                effectiveFrom: new Date().toISOString(),
              },
            },
            {
              onSuccess,
              onError,
            }
          );
        } else {
          // Compute end date from start date and duration
          const end = new Date(value.start).getTime() + value.duration * 60000;
          updateLessonInstance.mutateAsync(
            {
              instanceId: initialValues.lesson.id,
              request: {
                ...value,
                end: new Date(end).toISOString(),
                riderIds: value.riderIds,
              },
            },
            {
              onSuccess,
              onError,
            }
          );
        }
      } else {
        createLessonSeries.mutateAsync(
          {
            ...value,
            recurrenceFrequency: value.isRecurring
              ? (value.recurrenceFrequency ?? RecurrenceFrequency.WEEKLY)
              : null,
            effectiveFrom: new Date().toISOString(),
            overrideAvailability: initialValues.overrideBusinessHours,
          },
          {
            onSuccess,
            onError,
          }
        );
      }
    },
  });

  const onCancelInstance = () => {
    if (!initialValues.lesson) return;
    const lesson = initialValues.lesson;

    confirmationModalHandler.openWithPayload({
      title: "Cancel Lesson?",
      description:
        "Are you sure you want to cancel this lesson? This action cannot be undone. All enrolled riders will be removed.",
      confirmLabel: "Cancel Lesson",
      cancelLabel: "Cancel",
      onConfirm: () => {
        cancelLessonInstance.mutateAsync(
          {
            instanceId: lesson.id,
            request: {
              reason: "User cancelled",
            },
          },
          {
            onSuccess: () => {
              lessonModalHandler.close();
              toast.success("Lesson cancelled successfully");
            },
            onError: () => {
              toast.error("Failed to cancel lesson");
            },
          }
        );
      },
    });
  };

  const onCancelSeries = () => {
    if (!initialValues.lesson) return;
    const lesson = initialValues.lesson;

    confirmationModalHandler.openWithPayload({
      title: "Cancel Lesson Series?",
      description:
        "Are you sure you want to cancel this lesson series? This action cannot be undone. All lessons in the series will be cancelled.",
      confirmLabel: "Cancel Lesson Series",
      cancelLabel: "Cancel",
      onConfirm: () => {
        cancelLessonSeries.mutateAsync(
          {
            seriesId: lesson.seriesId,
            request: {
              reason: "User cancelled",
            },
          },
          {
            onSuccess: () => {
              lessonModalHandler.close();
              toast.success("Lesson series cancelled successfully");
            },
            onError: () => {
              toast.error("Failed to cancel lesson series");
            },
          }
        );
      },
    });
  };

  // ---- Cascading field values ----
  const serviceId = useStore(form.store, (s) => s.values.serviceId);
  const isRecurring = useStore(form.store, (s) => s.values.isRecurring);

  // ---- Data queries (cascade: board → trainer → service) ----
  const { boards, trainers, levels, services, riders, isPending } = useQueries({
    queries: [
      boardsOptions.list(),
      membersOptions.trainers(),
      levelOptions.list(),
      servicesOptions.all(),
      membersOptions.riders(),
    ],
    combine: (results) => ({
      boards: results[0].data ?? [],
      trainers: results[1].data ?? [],
      levels: results[2].data ?? [],
      services: results[3].data ?? [],
      riders: results[4].data ?? [],
      isPending: results.some((r) => r.isPending),
    }),
  });

  // ---- Section gating ----
  const detailsReady = !!serviceId;

  // Auto-advance: when scheduling is filled, open details
  const prevServiceId = React.useRef(serviceId);
  React.useEffect(() => {
    if (serviceId && !prevServiceId.current) {
      setOpenSection("details");
    }
    prevServiceId.current = serviceId;
  }, [serviceId]);

  if (isPending) return null;

  return (
    <DialogContent className="min-w-3xl w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {initialValues.lesson ? "Edit Lesson" : "New Lesson"}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[calc(100vh-12rem)] space-y-3 overflow-y-auto py-4 pr-1">
          <SchedulingSection
            form={form}
            boards={boards}
            trainers={trainers}
            services={services}
            levels={levels}
            isOpen={openSection === "scheduling"}
            onOpenChange={() =>
              setOpenSection((prev) =>
                prev === "scheduling" ? null : "scheduling"
              )
            }
          />
          <DetailsSection
            form={form}
            isReady={detailsReady}
            isOpen={openSection === "details"}
            onOpenChange={() =>
              setOpenSection((prev) => (prev === "details" ? null : "details"))
            }
          />
          <RidersSection
            form={form}
            riders={riders}
            isOpen={openSection === "riders"}
            onOpenChange={() =>
              setOpenSection((prev) => (prev === "riders" ? null : "riders"))
            }
          />
        </div>
        <DialogFooter>
          {initialValues.lesson && isRecurring && (
            <Field orientation="horizontal">
              <Checkbox checked={saveFuture} onCheckedChange={setSaveFuture} />
              <Label>Save for all future lessons?</Label>
            </Field>
          )}
          <form.AppForm>
            <form.SubmitButton
              label={initialValues.lesson ? "Update Lesson" : "Create Lesson"}
              loadingLabel={
                initialValues.lesson
                  ? "Updating Lesson..."
                  : "Creating Lesson..."
              }
            />
          </form.AppForm>
          {initialValues.lesson && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="destructive" size="icon" type="button" />
                }
              >
                <TrashIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Cancel Lesson</DropdownMenuLabel>
                  <DropdownMenuItem onClick={onCancelInstance}>
                    Cancel instance
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onCancelSeries}>
                    Cancel series
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
