import { useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { RiderCreateLessonModal } from "@/features/lessons/components/modals/quick-create/rider/modal";

import type { HourCellProps } from ".";
import { HourCellShell } from "./shell";

export function PortalHourCell(props: HourCellProps) {
  const { selectedBoardId, boards } = useCalendar();
  const modal = RiderCreateLessonModal.useModal();
  const { effectiveRiders } = useRouteContext({
    from: "/org/$slug/(authenticated)/portal",
  });

  const selectedBoard = boards.find((b) => b.id === selectedBoardId);

  const handleClick = (start: Date) => {
    if (!selectedBoard) return;

    if (!selectedBoard.canRiderAdd) {
      toast.info("This board does not allow you to create lessons.");
      return;
    }

    if (props.isDisabled) {
      toast.info("This hour is not available.");
      return;
    }

    modal.open({
      riders: effectiveRiders,
      initialValues: {
        start: start.toISOString(),
        boardId: selectedBoard.id,
        trainerId: props.trainerId,
      },
    });
  };

  return <HourCellShell {...props} onClick={handleClick} />;
}
