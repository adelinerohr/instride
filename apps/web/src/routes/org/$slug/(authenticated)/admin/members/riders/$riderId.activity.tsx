import { activityQueries } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ActivityItem } from "@/features/organization/components/activity/item";
import {
  Timeline,
  TimelineDate,
  TimelineDescription,
  TimelineItem,
  TimelineTitle,
} from "@/shared/components/ui/timeline";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/members/riders/$riderId/activity"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { riderId } = Route.useParams();
  const { member } = Route.useRouteContext();
  const { data: activities } = useSuspenseQuery(
    activityQueries.listRider(riderId, member.id)
  );

  return (
    <Timeline>
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
      <TimelineItem>
        <TimelineDate>
          {new Date(member.createdAt).toLocaleDateString()}
        </TimelineDate>
        <TimelineTitle>Member created</TimelineTitle>
        <TimelineDescription>
          {member.authUser?.name} was created
        </TimelineDescription>
      </TimelineItem>
    </Timeline>
  );
}
