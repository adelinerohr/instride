import {
  useKioskCancelLessonInstance,
  useKioskEnrollInInstance,
  useKioskUnenrollFromInstance,
  type LessonInstance,
} from "@instride/api";
import { KioskActions, MembershipRole } from "@instride/shared";
import { isBefore } from "date-fns";
import { EditIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

import { useKiosk } from "@/features/kiosk/hooks/use-kiosk";
import { usePinAuth } from "@/features/kiosk/hooks/use-pin-auth";
import { ConfirmationModal } from "@/shared/components/confirmation-modal";
import { Button } from "@/shared/components/ui/button";
import { SheetFooter } from "@/shared/components/ui/sheet";

interface KioskViewLessonFooterProps {
  lesson: LessonInstance;
}

export function KioskViewLessonFooter({ lesson }: KioskViewLessonFooterProps) {
  const confirmationModal = ConfirmationModal.useModal();
  const { sessionId } = useKiosk();
  const pinAuth = usePinAuth();

  const enroll = useKioskEnrollInInstance();
  const unenroll = useKioskUnenrollFromInstance();
  const cancelLesson = useKioskCancelLessonInstance();

  const isMutating =
    enroll.isPending || unenroll.isPending || cancelLesson.isPending;

  const hasPassed = isBefore(new Date(lesson.start), new Date());
  const isFull = lesson.enrollments.length >= lesson.maxRiders;

  // ---- Handlers ----

  const handleEnroll = () => {
    pinAuth.requestWithRider({
      context: { action: KioskActions.ENROLL },
      title: "Join lesson",
      description: "Verify your PIN to enroll in this lesson.",
      filterRiderOptions: (options) => {
        const enrolledRiderIds = new Set(
          lesson.enrollments.map((e) => e.rider.id)
        );
        return options.filter((rider) => !enrolledRiderIds.has(rider.id));
      },
      noRidersMessage: "No eligible riders to enroll in this lesson",
      riderSelectTitle: "Who would you like to enroll?",
      onAuthorized: async ({ rider, verification }) => {
        await enroll.mutateAsync(
          {
            sessionId,
            instanceId: lesson.id,
            riderMemberId: rider.memberId,
            verification,
          },
          {
            onSuccess: () => toast.success("Successfully enrolled in lesson"),
            onError: (error) => toast.error(error.message),
          }
        );
      },
    });
  };

  const handleCancelLesson = () => {
    pinAuth.request({
      context: {
        action: KioskActions.LESSON_CANCEL,
        lessonInstanceId: lesson.id,
      },
      title: "Cancel lesson",
      description: "Verify your PIN to cancel this lesson.",
      onAuthorized: ({ member, verification }) => {
        confirmationModal.open({
          title: "Cancel Lesson?",
          description:
            "Are you sure you want to cancel this lesson? This action cannot be undone. All enrolled riders will be removed.",
          confirmLabel: "Cancel Lesson",
          cancelLabel: "Cancel",
          onConfirm: async () =>
            await cancelLesson.mutateAsync(
              {
                sessionId,
                instanceId: lesson.id,
                reason: `${member.authUser.name} cancelled the lesson.`,
                verification,
              },
              {
                onSuccess: () => toast.success("Lesson cancelled successfully"),
                onError: (error) => toast.error(error.message),
              }
            ),
        });
      },
    });
  };

  const handleEdit = () => {
    pinAuth.request({
      context: { action: KioskActions.LESSON_EDIT },
      title: "Edit lesson",
      description: "Verify your PIN to edit this lesson.",
      deniedMessage: "Only staff can edit lessons",
      onAuthorized: ({ member, verification }) => {
        const isStaff =
          member.roles.includes(MembershipRole.ADMIN) ||
          member.roles.includes(MembershipRole.TRAINER);
        if (!isStaff) {
          toast.error("Only staff can edit lessons");
          return;
        }
        // The edit modal needs to know it's running in a kiosk-verified
        // context so it can include `verification` in its submit. Pass it
        // via the modal payload.
        // TODO: Add leson edit modal
      },
    });
  };

  if (hasPassed) {
    return (
      <SheetFooter className="bg-muted flex flex-row gap-2 items-center justify-end">
        <Button onClick={handleEdit} disabled={isMutating}>
          <EditIcon />
          Edit
        </Button>
      </SheetFooter>
    );
  }

  return (
    <SheetFooter className="bg-muted flex flex-row gap-2 items-center justify-between">
      {!isFull && (
        <Button onClick={handleEnroll} disabled={isMutating}>
          Enroll
        </Button>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleEdit} disabled={isMutating}>
          <EditIcon />
          Edit
        </Button>
        <Button
          variant="destructive"
          onClick={handleCancelLesson}
          disabled={isMutating}
        >
          <TrashIcon />
          Cancel Lesson
        </Button>
      </div>
    </SheetFooter>
  );
}
