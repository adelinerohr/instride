import {
  useBoardsForRider,
  useCreateLessonSeries,
  useServices,
} from "@instride/api";
import { useStore } from "@tanstack/react-form";
import { useRouteContext } from "@tanstack/react-router";

import { useAppForm } from "@/shared/hooks/use-form";

import {
  buildRiderCreateLessonDefaultValues,
  riderCreateLessonFormOpts,
} from "../../lib/rider.form";
import { resolveRiderOptions } from "../../lib/utils";
import { BoardSelect } from "./fragments/board-select";
import { BookingCalendar } from "./fragments/booking-calendar";
import { BookingForSection } from "./fragments/booking-for";
import { ServiceSelect } from "./fragments/service";
import { TrainerSelect } from "./fragments/trainer-select";

interface RiderCreateLessonFormProps {
  riderId?: string;
  initialValues: {
    start?: string;
    boardId?: string;
    trainerId?: string;
  };
}

export function RiderCreateLessonForm({
  riderId,
  initialValues,
}: RiderCreateLessonFormProps) {
  const { organization, ...context } = useRouteContext({
    from: "/org/$slug/(authenticated)/portal",
  });

  const createLesson = useCreateLessonSeries();
  const resolvedRiders = resolveRiderOptions(context);
  const showRiderSelect = resolvedRiders.length > 1;

  const form = useAppForm({
    ...riderCreateLessonFormOpts,
    defaultValues: buildRiderCreateLessonDefaultValues({
      initialValues: { ...initialValues, riderId },
      timeZone: organization.timezone,
      boards: [],
      trainers: [],
    }),
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  const selectedRiderId = useStore(form.store, (state) => state.values.riderId);
  const selectedRider = resolvedRiders.find((r) => r.id === selectedRiderId);

  const { data: availableBoards, isPending: isPendingBoards } =
    useBoardsForRider(
      selectedRiderId
        ? { riderId: selectedRiderId, canRiderAdd: true }
        : undefined
    );

  const { data: allServices, isPending: isPendingServices } = useServices();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="grid grid-cols-[1fr_320px] gap-6"
    >
      <div className="space-y-6">
        {showRiderSelect && (
          <BookingForSection form={form} riders={resolvedRiders} />
        )}
        <BoardSelect
          form={form}
          boards={availableBoards ?? []}
          isPending={isPendingBoards}
        />
        <TrainerSelect form={form} boards={availableBoards ?? []} />
        <ServiceSelect
          form={form}
          boards={availableBoards ?? []}
          services={allServices ?? []}
          isPending={isPendingBoards || isPendingServices}
          riderLevelId={selectedRider?.ridingLevelId ?? null}
        />
        <BookingCalendar form={form} organization={organization} />
      </div>
    </form>
  );
}
