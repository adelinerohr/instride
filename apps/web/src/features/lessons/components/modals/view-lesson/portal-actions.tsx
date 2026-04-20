import {
  enrollmentOptions,
  useEnrollInInstance,
  useEnrollInSeries,
  useUnenrollFromInstance,
  useUnenrollFromSeries,
  type types,
} from "@instride/api";
import { LessonSeriesEnrollmentStatus } from "@instride/shared";
import { useQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";

import { Button } from "@/shared/components/ui/button";

type PortalActionsProps = {
  instance: types.LessonInstance;
  onClose: () => void;
};

export function PortalActions({ instance, onClose }: PortalActionsProps) {
  const { member } = useRouteContext({
    from: "/org/$slug/(authenticated)",
  });

  const rider = member.rider;
  if (!rider) {
    return null;
  }

  // Series enrollment check (only when the instance belongs to a recurring series)
  const seriesId = instance.seriesId;
  const { data } = useQuery({
    ...enrollmentOptions.listSeries(seriesId),
    enabled: !!seriesId,
  });

  const activeSeriesEnrollments = data?.enrollments.filter(
    (e) => e.status === LessonSeriesEnrollmentStatus.ACTIVE
  );

  const userSeriesEnrollment = activeSeriesEnrollments?.find(
    (e) => e.rider?.memberId === member.id
  );
  const isEnrolledInSeries = !!userSeriesEnrollment;

  // Mutations — all invalidate the instance + series enrollment queries
  const enrollInInstance = useEnrollInInstance({
    mutationConfig: {
      onSuccess: () => onClose(),
    },
  });
  const enrollInSeries = useEnrollInSeries({
    mutationConfig: {
      onSuccess: () => onClose(),
    },
  });
  const unenrollFromInstance = useUnenrollFromInstance({
    mutationConfig: {
      onSuccess: () => onClose(),
    },
  });
  const unenrollFromSeries = useUnenrollFromSeries({
    mutationConfig: {
      onSuccess: () => onClose(),
    },
  });

  const isLoading =
    enrollInInstance.isPending ||
    enrollInSeries.isPending ||
    unenrollFromInstance.isPending ||
    unenrollFromSeries.isPending;

  const userInstanceEnrollment = instance.enrollments?.find(
    (e) => e.rider?.memberId === member.id
  );
  const isCurrentUserEnrolled = !!userInstanceEnrollment;

  const hasPassed = new Date(instance.start) < new Date();
  const isPrivate = instance.service?.isPrivate ?? false;
  const isRecurring = !!instance.series?.isRecurring;

  // Lesson has passed
  if (hasPassed) {
    return (
      <Button disabled variant="secondary">
        Lesson has passed
      </Button>
    );
  }

  // Not enrolled — show join options
  if (!isCurrentUserEnrolled) {
    return (
      <>
        <Button
          onClick={() =>
            enrollInInstance.mutate({
              instanceId: instance.id,
              request: { riderIds: [rider.id] },
            })
          }
          disabled={isLoading}
        >
          Join lesson
        </Button>
        {isRecurring && !isEnrolledInSeries && seriesId && (
          <Button
            onClick={() =>
              enrollInSeries.mutate({
                seriesId,
                request: {
                  riderIds: [rider.id],
                  startDate: instance.start,
                  endDate: instance.end,
                },
              })
            }
            disabled={isLoading}
            variant="outline"
          >
            Join series
          </Button>
        )}
      </>
    );
  }

  // Enrolled in a private lesson — no self-unenroll
  if (isPrivate) {
    return null;
  }

  // Enrolled — show leave options
  return (
    <>
      <Button
        onClick={() => unenrollFromInstance.mutate(userInstanceEnrollment.id)}
        disabled={isLoading}
        variant="destructive"
      >
        Leave lesson
      </Button>
      {isRecurring && isEnrolledInSeries && seriesId && (
        <Button
          onClick={() => unenrollFromSeries.mutate(userSeriesEnrollment.id)}
          disabled={isLoading}
          variant="outline"
        >
          Leave series
        </Button>
      )}
    </>
  );
}
