import { activityQueries } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { ActivityItem } from "@/features/organization/components/activity/item";
import { buttonVariants } from "@/shared/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Timeline,
  TimelineDate,
  TimelineDescription,
  TimelineItem,
  TimelineTitle,
} from "@/shared/components/ui/timeline";
import { cn } from "@/shared/lib/utils";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/members/riders/$riderId/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug, riderId } = Route.useParams();
  const { member } = Route.useRouteContext();

  const { data: activities } = useSuspenseQuery(
    activityQueries.listRider(riderId, member.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardAction>
          <Link
            to="/org/$slug/admin/members/riders/$riderId/activity"
            params={{ slug, riderId }}
            className={cn(
              buttonVariants({ variant: "link", size: "sm" }),
              "w-full"
            )}
          >
            View all activity
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
