import { enrollmentOptions } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format, startOfDay, subDays } from "date-fns";
import { Clock2Icon } from "lucide-react";

import { Empty, EmptyHeader, EmptyTitle } from "@/shared/components/ui/empty";
import {
  Timeline,
  TimelineDate,
  TimelineItem,
  TimelineTitle,
} from "@/shared/components/ui/timeline";

export function RiderLessonsTab() {
  const now = new Date();
  const thirtyDaysAgo = startOfDay(subDays(now, 30));

  const { data: instanceEnrollments } = useSuspenseQuery(
    enrollmentOptions.myEnrollments(
      thirtyDaysAgo.toISOString(),
      now.toISOString()
    )
  );

  if (!instanceEnrollments) return null;

  return (
    <Timeline>
      {instanceEnrollments.length > 0 ? (
        instanceEnrollments.map((instanceEnrollment) => (
          <TimelineItem>
            <TimelineTitle>
              {instanceEnrollment.instance?.name ??
                instanceEnrollment.instance?.service?.name ??
                "Unknown lesson"}
            </TimelineTitle>
            <TimelineDate>
              <Clock2Icon className="size-3" />
              {format(
                new Date(instanceEnrollment.instance?.start ?? ""),
                "MMM d, yyyy"
              )}
            </TimelineDate>
          </TimelineItem>
        ))
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No lessons taken yet.</EmptyTitle>
          </EmptyHeader>
        </Empty>
      )}
    </Timeline>
  );
}
