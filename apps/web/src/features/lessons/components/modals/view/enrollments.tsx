import {
  getUser,
  useKioskUnenrollFromInstance,
  useUnenrollFromInstance,
  type LessonInstance,
  type LessonInstanceEnrollment,
} from "@instride/api";
import { KioskActions } from "@instride/shared";
import { isBefore } from "date-fns";
import { toast } from "sonner";

import { useKiosk } from "@/features/kiosk/hooks/use-kiosk";
import { usePinAuth } from "@/features/kiosk/hooks/use-pin-auth";
import { ConfirmationModal } from "@/shared/components/confirmation-modal";
import { Button } from "@/shared/components/ui/button";

interface EnrolledRiderActionProps {
  enrollment: LessonInstanceEnrollment;
  lesson: LessonInstance;
}

export function AdminEnrolledRiderAction({
  enrollment,
  lesson,
}: EnrolledRiderActionProps) {
  const confirmationModal = ConfirmationModal.useModal();
  const unenroll = useUnenrollFromInstance();

  const hasPassed = isBefore(new Date(lesson.start), new Date());

  const riderUser = getUser({ rider: enrollment.rider });

  const handleUnenroll = () => {
    confirmationModal.open({
      title: `Unenroll ${riderUser.name}?`,
      description:
        "Are you sure? This will remove them from this lesson. This action cannot be undone.",
      confirmLabel: "Unenroll",
      cancelLabel: "Cancel",
      onConfirm: async () =>
        await unenroll.mutateAsync(
          { enrollmentId: enrollment.id },
          {
            onSuccess: () => toast.success("Rider unenrolled"),
            onError: (error) => toast.error(error.message),
          }
        ),
    });
  };

  if (hasPassed) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleUnenroll}
      disabled={unenroll.isPending}
      aria-label="Unenroll rider"
      className="text-destructive"
    >
      Unenroll
    </Button>
  );
}

export function KioskEnrolledRiderAction({
  enrollment,
  lesson,
}: EnrolledRiderActionProps) {
  const { sessionId } = useKiosk();
  const pinAuth = usePinAuth();
  const unenroll = useKioskUnenrollFromInstance();

  const hasPassed = isBefore(new Date(lesson.start), new Date());
  const riderUser = getUser({ rider: enrollment.rider });

  const handleUnenroll = () => {
    if (!enrollment.rider) return;
    const targetMemberId = enrollment.rider.memberId;

    pinAuth.request({
      context: { action: KioskActions.UNENROLL, targetMemberId },
      preselectedMemberId: targetMemberId,
      title: "Unenroll rider",
      description: `Verify your PIN to unenroll ${riderUser.name} from this lesson.`,
      onAuthorized: async ({ verification }) => {
        await unenroll.mutateAsync(
          {
            sessionId,
            enrollmentId: enrollment.id,
            verification,
          },
          {
            onSuccess: () => toast.success("Rider unenrolled"),
            onError: (error) => toast.error(error.message),
          }
        );
      },
    });
  };

  if (hasPassed) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleUnenroll}
      disabled={unenroll.isPending}
      aria-label="Unenroll rider"
      className="text-destructive"
    >
      Unenroll
    </Button>
  );
}
