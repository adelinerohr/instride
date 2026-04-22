import {
  boardsOptions,
  guardianOptions,
  membersOptions,
  servicesOptions,
  useCreateLessonSeries,
} from "@instride/api";
import { canDependentPerform, DependentAction } from "@instride/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import {
  buildPortalLessonDefaultValues,
  portalLessonFormOpts,
} from "@/features/lessons/lib/portal-lesson.form";
import { Page, PageBody, PageHeader } from "@/shared/components/layout/page";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { FieldGroup } from "@/shared/components/ui/field";
import { useAppForm } from "@/shared/hooks/use-form";

import { BookingCalendar } from "./-booking-calendar";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/portal/lessons/create"
)({
  component: RouteComponent,
  validateSearch: z.object({
    date: z.string().optional(),
    boardId: z.string().optional(),
    trainerId: z.string().optional(),
    riderId: z.string().optional(),
  }),
  beforeLoad: async ({ context }) => {
    if (context.effectiveRiderIds.length === 0) {
      throw Route.redirect({
        to: "/org/$slug/portal",
      });
    }
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(boardsOptions.list()),
      context.queryClient.ensureQueryData(membersOptions.riders()),
      context.queryClient.ensureQueryData(servicesOptions.all()),
      context.queryClient.ensureQueryData(membersOptions.trainers()),
      context.isGuardian
        ? context.queryClient.ensureQueryData(guardianOptions.myDependents())
        : Promise.resolve(),
    ]);
  },
});

function RouteComponent() {
  const { effectiveRiderIds, ...context } = Route.useRouteContext();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data: boards } = useSuspenseQuery(boardsOptions.list());
  const { data: riders } = useSuspenseQuery(membersOptions.riders());
  const { data: trainers } = useSuspenseQuery(membersOptions.trainers());
  const { data: services } = useSuspenseQuery(servicesOptions.all());

  const createLesson = useCreateLessonSeries();

  const isGuardian = context.isGuardian;
  const ownRider =
    context.isGuardian && context.isOnlyGuardian
      ? null
      : context.isGuardian
        ? context.rider
        : context.rider;
  const dependentPermissions =
    !context.isGuardian && context.isDependent ? context.permissions : null;
  const onlyOneDependent =
    isGuardian && !ownRider && effectiveRiderIds.length === 1;

  const getInitialRiderId = () => {
    if (effectiveRiderIds.length === 1) {
      return effectiveRiderIds[0];
    }
    if (search.riderId) {
      return search.riderId;
    }
    return undefined;
  };

  const form = useAppForm({
    ...portalLessonFormOpts,
    defaultValues: buildPortalLessonDefaultValues({
      initialValues: search,
      boards,
      trainers,
      riderId: getInitialRiderId(),
    }),
    onSubmit: async ({ value, formApi }) => {
      const service = services.find((s) => s.id === value.serviceId);
      if (!service) {
        toast.error(
          "Invalid service selected. Please select a different service."
        );
        return;
      }

      if (
        !value.acknowledgePrivateLesson &&
        (!service.isPrivate || service.maxRiders > 1)
      ) {
        toast.error("You must acknowledge that the lesson may become private");
        formApi.setErrorMap({
          onSubmit: {
            fields: {
              acknowledgePrivateLesson: [
                "You must acknowledge that the lesson may become private",
              ],
            },
          },
        });
        return;
      }

      if (!value.start || value.start.trim().length === 0) {
        toast.error("Please select a time slot");
        formApi.setErrorMap({
          onSubmit: {
            fields: { start: ["Please select a time slot"] },
          },
        });
        return;
      }

      if (dependentPermissions && value.riderId === ownRider?.id) {
        const canBookLesson = canDependentPerform(
          DependentAction.BOOK_LESSON,
          dependentPermissions
        );
        if (!canBookLesson.allowed) {
          toast.error(
            canBookLesson.reason ?? "You are not allowed to book lessons"
          );
          return;
        }
      }

      await createLesson.mutateAsync(
        {
          boardId: value.boardId,
          serviceId: value.serviceId,
          start: value.start,
          trainerId: value.trainerId,
          duration: service.duration,
          maxRiders: service.maxRiders,
          riderIds: [value.riderId],
        },
        {
          onSuccess: () => {
            toast.success("Lesson created successfully");
            navigate({ to: "/org/$slug/portal" });
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    },
  });

  const filteredBoards = boards.filter((board) =>
    board.serviceBoardAssignments?.some(
      (assignment) => assignment.service?.canRiderAdd === true
    )
  );

  const riderOptions = riders.filter((rider) =>
    effectiveRiderIds.includes(rider.id)
  );

  if (filteredBoards.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircleIcon />
          </EmptyMedia>
          <EmptyTitle>No boards available</EmptyTitle>
          {boards.length === 0 ? (
            <EmptyDescription>
              You do not have access to any boards. Please contact your
              administrator to be added to a board.
            </EmptyDescription>
          ) : (
            <EmptyDescription>
              The boards you have access to do not allow you to create lessons.
              Please contact your administrator to be added to a board that
              allows you to create lessons.
            </EmptyDescription>
          )}
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="min-h-0"
    >
      <Page>
        <PageHeader title="Book Lesson">
          <form.AppForm>
            <form.SubmitButton label="Create" loadingLabel="Creating..." />
          </form.AppForm>
        </PageHeader>
        <PageBody className="space-y-4">
          {effectiveRiderIds.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Rider</CardTitle>
              </CardHeader>
              <CardContent>
                <form.AppField
                  name="riderId"
                  listeners={{
                    onChange: () => {
                      form.setFieldValue("boardId", "");
                      form.setFieldValue("trainerId", "");
                      form.setFieldValue("serviceId", "");
                      form.setFieldValue("start", "");
                      form.setFieldValue("acknowledgePrivateLesson", false);
                    },
                  }}
                  children={(field) => (
                    <field.RiderSelectField
                      riders={riderOptions}
                      disabled={onlyOneDependent}
                      hideLabel
                      placeholder="Select a rider"
                    />
                  )}
                />
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Board</CardTitle>
            </CardHeader>
            <CardContent>
              <form.Subscribe selector={(state) => state.values.riderId}>
                {(riderId) => {
                  if (isGuardian && riderId.length === 0) {
                    return (
                      <div className="text-sm text-muted-foreground">
                        Please select a rider to continue.
                      </div>
                    );
                  }

                  const boardOptions = filteredBoards.filter((board) =>
                    riders.some((rider) =>
                      rider.boardAssignments?.some(
                        (assignment) => assignment.boardId === board.id
                      )
                    )
                  );

                  return (
                    <form.AppField
                      name="boardId"
                      listeners={{
                        onChange: ({ value }) => {
                          // Check if the trainer is assigned to the board changed to
                          const trainer = form.getFieldValue("trainerId");
                          const isAssigned = trainers
                            .find((t) => t.id === trainer)
                            ?.boardAssignments?.some(
                              (b) => b.boardId === value
                            );

                          if (!isAssigned) {
                            form.setFieldValue("trainerId", "");
                            form.setFieldValue("serviceId", "");
                            form.setFieldValue("start", "");
                          } else {
                            // If it is assigned, only clear the service and start date
                            form.setFieldValue("serviceId", "");
                            form.setFieldValue("start", "");
                          }
                        },
                      }}
                      children={(field) => (
                        <field.SelectField
                          items={boardOptions}
                          placeholder="Select a board"
                          itemToValue={(board) => board.id}
                          renderValue={(board) => board.name}
                        />
                      )}
                    />
                  );
                }}
              </form.Subscribe>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Trainer</CardTitle>
            </CardHeader>
            <CardContent>
              <form.Subscribe selector={(state) => state.values.boardId}>
                {(boardId) =>
                  boardId.length > 0 ? (
                    <form.AppField
                      name="trainerId"
                      listeners={{
                        onChange: ({ value }) => {
                          // Check if the service is assigned to the trainer changed to
                          const service = form.getFieldValue("serviceId");
                          const isAssigned = services
                            .find((s) => s.id === service)
                            ?.trainerAssignments?.some(
                              (t) => t.trainerId === value
                            );

                          if (!isAssigned) {
                            form.setFieldValue("serviceId", "");
                            form.setFieldValue("start", "");
                          } else {
                            // If it is assigned, only clear the start date
                            form.setFieldValue("start", "");
                          }
                        },
                      }}
                      children={(field) => (
                        <field.TrainerSelectField
                          hideLabel
                          trainers={(trainers ?? []).filter((trainer) =>
                            trainer.boardAssignments?.some(
                              (assignment) => assignment.boardId === boardId
                            )
                          )}
                          placeholder="Select a trainer"
                        />
                      )}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Please select a board to continue.
                    </div>
                  )
                }
              </form.Subscribe>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Service</CardTitle>
            </CardHeader>
            <CardContent>
              <form.Subscribe
                selector={(state) => [
                  state.values.boardId,
                  state.values.trainerId,
                  state.values.serviceId,
                ]}
              >
                {([boardId, trainerId, serviceId]) => {
                  const selectedService = services.find(
                    (s) => s.id === serviceId
                  );
                  const isPrivate =
                    (selectedService?.isPrivate ||
                      selectedService?.maxRiders === 1) ??
                    false;

                  const serviceOptions = services.filter(
                    (service) =>
                      service.boardAssignments?.some(
                        (assignment) => assignment.boardId === boardId
                      ) &&
                      service.trainerAssignments?.some(
                        (assignment) => assignment.trainerId === trainerId
                      )
                  );

                  if (boardId.length > 0 && trainerId.length > 0) {
                    return (
                      <FieldGroup>
                        <form.AppField
                          name="serviceId"
                          children={(field) => (
                            <field.ServiceSelectField
                              hideLabel
                              placeholder="Select a service"
                              services={serviceOptions ?? []}
                            />
                          )}
                        />
                        {!isPrivate && (
                          <form.AppField
                            name="acknowledgePrivateLesson"
                            children={(field) => (
                              <field.CheckboxField
                                label="I understand that if no one else signs up for this lesson, it will become a private lesson and you will be charged as such."
                                checked={field.state.value ?? false}
                                onCheckedChange={(checked) => {
                                  field.handleChange(checked === true);
                                }}
                              />
                            )}
                          />
                        )}
                      </FieldGroup>
                    );
                  } else {
                    return (
                      <div className="text-sm text-muted-foreground">
                        Please select a board and trainer to continue.
                      </div>
                    );
                  }
                }}
              </form.Subscribe>
            </CardContent>
          </Card>
          <BookingCalendar form={form} />
        </PageBody>
      </Page>
    </form>
  );
}
