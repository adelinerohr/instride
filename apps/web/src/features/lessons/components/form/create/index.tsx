import {
  getUser,
  useBoards,
  useCreateLessonSeries,
  useRiderAssignments,
  useServices,
  useTrainers,
} from "@instride/api";
import { lessonSeriesSchema } from "@instride/shared";
import { useRouteContext } from "@tanstack/react-router";
import { AlertCircleIcon } from "lucide-react";
import z from "zod";

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
import { useAppForm } from "@/shared/hooks/use-form";

import { BookingCalendar } from "./booking-calendar";

type CreateLessonQueryParams = {
  boardId?: string | null;
  trainerId?: string | null;
  date?: string | null;
  time?: string | null;
};

type CreateLessonProps = {
  initialQuery?: CreateLessonQueryParams;
};

const riderCreateLessonSchema = lessonSeriesSchema
  .pick({
    boardId: true,
    serviceId: true,
    start: true,
    trainerId: true,
  })
  .extend({
    acknowledgePrivateLesson: z.boolean(),
  });

type RiderCreateLessonSchema = z.infer<typeof riderCreateLessonSchema>;

function createDefaultValues(
  initialQuery?: CreateLessonQueryParams
): RiderCreateLessonSchema {
  if (!initialQuery) {
    return {
      boardId: "",
      serviceId: "",
      start: new Date().toISOString(),
      trainerId: "",
      acknowledgePrivateLesson: false,
    };
  }

  const { boardId, trainerId, date } = initialQuery;

  return {
    boardId: boardId ?? "",
    serviceId: "",
    start: date ? new Date(date).toISOString() : new Date().toISOString(),
    trainerId: trainerId ?? "",
    acknowledgePrivateLesson: false,
  };
}

export function CreateLesson({ initialQuery }: CreateLessonProps = {}) {
  const { rider } = useRouteContext({ strict: false });
  const createLesson = useCreateLessonSeries();

  const { data: assignments } = useRiderAssignments(member?.rider?.id ?? "");
  const { data: trainers } = useTrainers();
  const { data: boards } = useBoards();
  const { data: services } = useServices();

  const form = useAppForm({
    defaultValues: createDefaultValues(initialQuery),
    validators: {
      onChange: riderCreateLessonSchema,
    },
    onSubmit: async ({ value }) => {
      const service = services?.find((s) => s.id === value.serviceId);
      if (!service) {
        throw new Error("Service not found");
      }

      await createLesson.mutateAsync({
        boardId: value.boardId,
        serviceId: value.serviceId,
        start: value.start,
        trainerId: value.trainerId,
        duration: service.duration,
        maxRiders: service.maxRiders,
        ...(member?.rider?.id ? { riderIds: [member.rider.id] } : {}),
      });
    },
  });

  const riderBoardIds =
    (assignments ?? []).map((assignment) => assignment.boardId) ?? [];
  const riderBoards =
    boards?.filter((board) => riderBoardIds.includes(board.id)) ?? [];

  const handleSlotSelect = (slotStartIso: string) => {
    form.setFieldValue("start", slotStartIso);
  };

  if (riderBoards?.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircleIcon />
          </EmptyMedia>
          <EmptyTitle>No boards available</EmptyTitle>
          <EmptyDescription>
            You do not have access to any boards. Please contact your
            administrator to be added to a board.
          </EmptyDescription>
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
      className="flex flex-col h-full"
    >
      <Page>
        <PageHeader title="Book Lesson">
          <form.AppForm>
            <form.SubmitButton
              label="Book Lesson"
              loadingLabel="Booking lesson..."
            />
          </form.AppForm>
        </PageHeader>
        <PageBody className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Board</CardTitle>
            </CardHeader>
            <CardContent>
              <form.AppField
                name="boardId"
                children={(field) => (
                  <field.SelectField
                    items={riderBoards ?? []}
                    placeholder="Select a board"
                    itemToValue={(board) => board.id}
                    renderValue={(board) => board.name}
                  />
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <form.Subscribe selector={(state) => state.values.boardId}>
                {(boardId) =>
                  boardId.length > 0 ? (
                    <form.AppField
                      name="trainerId"
                      children={(field) => (
                        <field.SelectField
                          items={(trainers ?? []).filter((trainer) =>
                            trainer.boardAssignments?.some(
                              (assignment) => assignment.boardId === boardId
                            )
                          )}
                          label="Trainer"
                          placeholder="Select a trainer"
                          itemToValue={(trainer) => trainer.id}
                          renderValue={(trainer) => getUser({ trainer }).name}
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
                ]}
              >
                {([boardId, trainerId]) =>
                  boardId.length > 0 && trainerId.length > 0 ? (
                    <form.AppField
                      name="serviceId"
                      children={(field) => (
                        <field.SelectField
                          label="Service"
                          placeholder="Select a service"
                          items={
                            services?.filter(
                              (service) =>
                                service.boardAssignments?.some(
                                  (assignment) => assignment.boardId === boardId
                                ) &&
                                service.trainerAssignments?.some(
                                  (assignment) =>
                                    assignment.trainerId === trainerId
                                )
                            ) ?? []
                          }
                          itemToValue={(service) => service.id}
                          renderValue={(service) => service.name}
                        />
                      )}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Please select a board and trainer to continue.
                    </div>
                  )
                }
              </form.Subscribe>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <form.Subscribe selector={(state) => state.values.serviceId}>
                {(serviceId) =>
                  serviceId.length > 0 ? (
                    <form.AppField
                      name="acknowledgePrivateLesson"
                      validators={{
                        onChange: ({ value }) => {
                          const service = services?.find(
                            (s) => s.id === serviceId
                          );
                          if (!service?.isPrivate && !value) {
                            return "You must acknowledge that the lesson may become private";
                          }
                          return undefined;
                        },
                      }}
                      children={(field) => (
                        <field.CheckboxField
                          label="You understand that if no one else signs up for this lesson, it will become a private lesson and you will be charged as such."
                          checked={field.state.value ?? false}
                          onCheckedChange={(checked) => {
                            field.handleChange(checked === true);
                          }}
                        />
                      )}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Please select a service to continue.
                    </div>
                  )
                }
              </form.Subscribe>
            </CardContent>
          </Card>

          <form.Subscribe
            selector={(state) => [
              state.values.boardId,
              state.values.trainerId,
              state.values.serviceId,
            ]}
          >
            {([boardId, trainerId, serviceId]) =>
              boardId.length > 0 &&
              trainerId.length > 0 &&
              serviceId.length > 0 && (
                <BookingCalendar
                  boardId={boardId}
                  trainerId={trainerId}
                  serviceId={serviceId}
                  riderId={member.rider.id}
                  onSlotSelect={handleSlotSelect}
                  selectedSlotStart={form.state.values.start}
                />
              )
            }
          </form.Subscribe>
        </PageBody>
      </Page>
    </form>
  );
}
