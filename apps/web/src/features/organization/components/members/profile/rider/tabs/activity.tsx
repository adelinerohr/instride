import type { Member } from "@instride/api";
import { formatDistanceToNow } from "date-fns";
import { Clock2Icon } from "lucide-react";

import {
  Timeline,
  TimelineDate,
  TimelineItem,
  TimelineTitle,
} from "@/shared/components/ui/timeline";

interface RiderActivityTabProps {
  member: Member;
}

export function RiderActivityTab({ member }: RiderActivityTabProps) {
  return (
    <Timeline>
      <TimelineItem>
        <TimelineTitle>Joined the organization</TimelineTitle>
        <TimelineDate>
          <Clock2Icon className="size-3" />
          {formatDistanceToNow(new Date(member.createdAt))}
        </TimelineDate>
      </TimelineItem>
      <TimelineItem>
        <TimelineTitle>Joined the organization</TimelineTitle>
        <TimelineDate>
          <Clock2Icon className="size-3" />
          {formatDistanceToNow(new Date(member.createdAt))} ago
        </TimelineDate>
      </TimelineItem>
    </Timeline>
  );
}
