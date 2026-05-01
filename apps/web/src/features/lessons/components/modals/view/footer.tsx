import {
  hasRole,
  useCancelLessonInstance,
  useEnrollInInstance,
  useUnenrollFromInstance,
  type LessonInstance,
} from "@instride/api";
import { MembershipRole } from "@instride/shared";
import { useRouteContext } from "@tanstack/react-router";
import { format, isBefore } from "date-fns";
import { EditIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

import { ConfirmationModal } from "@/shared/components/confirmation-modal";
import { Button } from "@/shared/components/ui/button";
import { SheetFooter } from "@/shared/components/ui/sheet";

interface ViewLessonFooterProps {
  lesson: LessonInstance;
  lessonName: string;
}

export function ViewLessonFooter({
  lesson,
  lessonName,
}: ViewLessonFooterProps) {
  const confirmationModal = ConfirmationModal.useModal();

  const cancelLesson = useCancelLessonInstance();
  const unenroll = useUnenrollFromInstance();
  const enroll = useEnrollInInstance();

  const isMutating =
    cancelLesson.isPending || enroll.isPending || unenroll.isPending;

  const context = useRouteContext({ strict: false });
  const member = context.member;

  if (!member) {
    throw new Error("Member not found");
  }

  const isAdmin = hasRole(member, MembershipRole.ADMIN);
  const isTrainer = hasRole(member, MembershipRole.TRAINER);
  const isRider = hasRole(member, MembershipRole.RIDER);

  const rider = member.rider;
  const hasPassed = isBefore(new Date(lesson.start), new Date());
  const isAssignedTrainer = lesson.trainer?.memberId === member.id;
  const myEnrollment = rider
    ? lesson.enrollments.find((e) => e.rider.id === rider.id)
    : undefined;
  const isEnrolled = !!myEnrollment;
  const isFull = lesson.enrollments.length >= lesson.maxRiders;

  // Dependent permission shortcuts
  const dependentCanBook =
    !context.isDependent ||
    context.permissions?.bookings.canBookLessons === true;
  const dependentCanCancel =
    !context.isDependent || context.permissions?.bookings.canCancel === true;

  // ---- Permission derivation ----
  const canManageLesson =
    !context.isPortal &&
    !hasPassed &&
    (isAdmin || (isTrainer && isAssignedTrainer));

  const can = {
    cancelLesson: canManageLesson,
    editLesson: canManageLesson,
    enroll:
      isRider &&
      !!rider &&
      !hasPassed &&
      !isEnrolled &&
      !isFull &&
      !isAssignedTrainer &&
      dependentCanBook,
    unenroll:
      isRider && !!rider && !hasPassed && isEnrolled && dependentCanCancel,
  };

  const handleCancelLesson = () => {
    confirmationModal.open({
      title: "Cancel Lesson?",
      description:
        "Are you sure you want to cancel this lesson? This action cannot be undone. All enrolled riders will be removed.",
      confirmLabel: "Cancel Lesson",
      cancelLabel: "Cancel",
      onConfirm: async () =>
        await cancelLesson.mutateAsync(
          {
            instanceId: lesson.id,
            reason: `${member.authUser.name} cancelled the lesson.`,
          },
          {
            onSuccess: () => {
              toast.success("Lesson cancelled successfully");
            },
            onError: (error) => {
              toast.error(error.message);
            },
          }
        ),
    });
  };

  const handleEnroll = () => {
    if (!rider) return;
    confirmationModal.open({
      title: `Join ${lessonName} on ${format(new Date(lesson.start), "EEEE, MMM d")}?`,
      description: `This lesson starts at ${format(new Date(lesson.start), "h:mm a")} and lasts ${lesson.service.duration} minutes`,
      confirmLabel: "Join lesson",
      cancelLabel: "Cancel",
      onConfirm: async () =>
        await enroll.mutateAsync(
          {
            instanceId: lesson.id,
            riderIds: [rider.id],
          },
          {
            onSuccess: () => {
              toast.success("Lesson enrolled successfully");
            },
            onError: (error) => {
              toast.error(error.message);
            },
          }
        ),
    });
  };

  const handleUnenroll = () => {
    if (!myEnrollment) return;
    confirmationModal.open({
      title: "Leave lesson?",
      description:
        "Are you sure you want to leave this lesson? This action cannot be undone.",
      confirmLabel: "Leave lesson",
      cancelLabel: "Cancel",
      onConfirm: async () =>
        await unenroll.mutateAsync(
          { enrollmentId: myEnrollment.id },
          {
            onSuccess: () => {
              toast.success("Lesson unenrolled successfully");
            },
            onError: (error) => {
              toast.error(error.message);
            },
          }
        ),
    });
  };

  return (
    <SheetFooter className="bg-muted flex flex-row gap-2 items-center justify-between">
      {can.cancelLesson && (
        <Button
          variant="destructive"
          onClick={handleCancelLesson}
          disabled={isMutating}
        >
          <TrashIcon />
          Cancel Lesson
        </Button>
      )}
      {can.editLesson && (
        <Button variant="outline" disabled={isMutating}>
          <EditIcon />
          Edit
        </Button>
      )}
      {can.enroll && (
        <Button onClick={handleEnroll} disabled={isMutating}>
          Join lesson
        </Button>
      )}
      {can.unenroll && (
        <Button onClick={handleUnenroll} disabled={isMutating}>
          Leave lesson
        </Button>
      )}
    </SheetFooter>
  );
}
