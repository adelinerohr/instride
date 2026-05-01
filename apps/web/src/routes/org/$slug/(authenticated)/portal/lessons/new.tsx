import { boardsOptions } from "@instride/api";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

import { RiderCreateLessonForm } from "@/features/lessons/components/new-form/rider-create";
import { Page, PageBody, PageHeader } from "@/shared/components/layout/page";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/portal/lessons/new"
)({
  component: RouteComponent,
  validateSearch: z.object({
    riderId: z.string().optional(),
    boardId: z.string().optional(),
    trainerId: z.string().optional(),
    start: z.string().optional(),
  }),
  beforeLoad: async ({ context, search }) => {
    const fromSearch =
      search.riderId &&
      context.effectiveRiders.some((rider) => rider.id === search.riderId)
        ? search.riderId
        : undefined;

    const fromSingleton =
      context.effectiveRiders.length === 1
        ? context.effectiveRiders[0].id
        : undefined;

    const resolvedRiderId = fromSearch ?? fromSingleton;

    return { resolvedRiderId };
  },
  loader: ({ context }) => {
    if (!context.resolvedRiderId) return;
    return context.queryClient.ensureQueryData(
      boardsOptions.forRider({
        riderId: context.resolvedRiderId,
        canRiderAdd: true,
      })
    );
  },
});

function RouteComponent() {
  const { resolvedRiderId } = Route.useRouteContext();
  const search = Route.useSearch();

  return (
    <Page>
      <PageHeader title="Book a lesson" />
      <PageBody>
        <RiderCreateLessonForm
          riderId={resolvedRiderId}
          initialValues={{
            start: search.start,
            boardId: search.boardId,
            trainerId: search.trainerId,
          }}
        />
      </PageBody>
    </Page>
  );
}
