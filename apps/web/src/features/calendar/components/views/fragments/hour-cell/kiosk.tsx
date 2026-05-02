import { KioskActions, MembershipRole } from "@instride/shared";
import { toast } from "sonner";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { usePinAuth } from "@/features/kiosk/hooks/use-pin-auth";
import { AdminCreateLessonModal } from "@/features/lessons/components/modals/quick-create/admin/modal";
import { RiderCreateLessonModal } from "@/features/lessons/components/modals/quick-create/rider/modal";

import type { HourCellProps } from ".";
import { HourCellShell } from "./shell";

export function KioskHourCell(props: HourCellProps) {
  const { selectedBoardId } = useCalendar();
  const adminCreateLessonModal = AdminCreateLessonModal.useModal();
  const riderCreateLessonModal = RiderCreateLessonModal.useModal();
  const pinAuth = usePinAuth();

  const handleClick = (start: Date) => {
    if (!selectedBoardId) {
      toast.error("Select a board before creating a lesson");
      return;
    }

    pinAuth.request({
      context: { action: KioskActions.LESSON_CREATE, boardId: selectedBoardId },
      title: "Create a lesson",
      description: "Verify your PIN to start creating a lesson.",
      onAuthorized: ({ member, riderOptions }) => {
        const payload = {
          start: start.toISOString(),
          boardId: selectedBoardId,
          trainerId: props.trainerId,
        };
        const isStaff =
          member.roles.includes(MembershipRole.ADMIN) ||
          member.roles.includes(MembershipRole.TRAINER);
        if (isStaff) {
          adminCreateLessonModal.open({ initialValues: payload });
        } else {
          riderCreateLessonModal.open({
            initialValues: payload,
            riders: riderOptions,
          });
        }
      },
      deniedMessage: "You are not allowed to create lessons here.",
    });
  };

  return <HourCellShell {...props} onClick={handleClick} />;
}
