import {
  useKioskEnrollInInstance,
  useKioskMarkAttendance,
  useKioskUnenrollFromInstance,
  type LessonInstance,
} from "@instride/api";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";

import { useKiosk } from "../../hooks/use-kiosk";
import { KioskScope } from "../../lib/types";

interface LessonsActionsProps {
  lesson: LessonInstance;
  onClose: () => void;
}

export function LessonsActions({ lesson, onClose }: LessonsActionsProps) {
  const { sessionId, acting, permissions } = useKiosk();

  const markAttendance = useKioskMarkAttendance({
    mutationConfig: {
      onSuccess: () => {
        onClose();
        toast.success("Attendance marked successfully");
      },
    },
  });
  const enroll = useKioskEnrollInInstance({
    mutationConfig: {
      onSuccess: () => {
        onClose();
        toast.success("Enrolled in lesson successfully");
      },
    },
  });
  const unenroll = useKioskUnenrollFromInstance({
    mutationConfig: {
      onSuccess: () => {
        onClose();
        toast.success("Unenrolled from lesson successfully");
      },
    },
  });

  const actingEnrollment = lesson.enrollments?.find(
    (enrollment) => enrollment.rider?.memberId === acting.actingMemberId
  );

  const hasPassed = new Date(lesson.start) < new Date();

  if (acting.scope === KioskScope.DEFAULT) {
    return <Button disabled>Select yourself to continue</Button>;
  }

  if (hasPassed) {
    return <Button disabled>Lesson has passed</Button>;
  }

  const canCheckIn =
    acting.scope === KioskScope.SELF &&
    acting.actingMemberId &&
    permissions.canCheckIn &&
    actingEnrollment;
  const canUnenroll = actingEnrollment && permissions.canUnenroll;
  const canEnroll =
    !actingEnrollment && permissions.canEnroll && acting.actingMemberId;

  return (
    <>
      {canCheckIn && (
        <Button
          onClick={() =>
            markAttendance.mutateAsync({
              enrollmentId: actingEnrollment.id,
              sessionId: sessionId!,
              attended: true,
            })
          }
        >
          Check In
        </Button>
      )}
      {canUnenroll && (
        <Button
          onClick={() =>
            unenroll.mutateAsync({
              enrollmentId: actingEnrollment.id,
              sessionId: sessionId!,
            })
          }
        >
          Unenroll
        </Button>
      )}
      {canEnroll && (
        <Button
          onClick={() =>
            enroll.mutateAsync({
              instanceId: lesson.id,
              sessionId: sessionId!,
              riderMemberId: acting.actingMemberId!,
            })
          }
        >
          Join Lesson
        </Button>
      )}
      {acting.scope === KioskScope.STAFF && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Staff mode: select a rider to enroll/check in
          </div>
          {/* TODO: Add rider selector dropdown + action buttons */}
        </div>
      )}
    </>
  );
}
