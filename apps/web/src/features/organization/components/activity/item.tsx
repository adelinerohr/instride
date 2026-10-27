import type { Activity } from "@instride/client";

import { EnrollmentActivity } from "./enrollment";

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  switch (activity.type) {
    case "enrollment_created": {
      return <EnrollmentActivity activity={activity} />;
    }
  }
}
