import { createFileRoute } from "@tanstack/react-router";

import { calendarSearchSchema } from "@/features/calendar/lib/search-params";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/portal/calendar/"
)({
  component: RouteComponent,
  validateSearch: calendarSearchSchema,
});

function RouteComponent() {
  return <div>Hello "/org/$slug/(authenticated)/portal/calendar/"!</div>;
}
