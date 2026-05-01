import { CalendarPlusIcon, ClockIcon } from "lucide-react";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { AdminCreateLessonModal } from "@/features/lessons/components/modals/quick-create/admin/modal";
import { CreateTimeBlockModal } from "@/features/organization/components/availability/time-blocks/modal";
import { ConfirmationModal } from "@/shared/components/confirmation-modal";
import { ContextMenuItem } from "@/shared/components/ui/context-menu";

import type { HourCellProps } from ".";
import { HourCellShell } from "./shell";

export function AdminHourCell(props: HourCellProps) {
  const { selectedBoardId } = useCalendar();
  const confirmationModal = ConfirmationModal.useModal();
  const adminCreateLessonModal = AdminCreateLessonModal.useModal();
  const createTimeBlockModal = CreateTimeBlockModal.useModal();

  const handleClick = (start: Date) => {
    if (!selectedBoardId) return;

    if (props.isDisabled) {
      confirmationModal.open({
        title: "This hour is out of business hours",
        description: "Would you like to book this lesson anyway?",
        confirmLabel: "Yes, create lesson",
        cancelLabel: "No, go back",
        onConfirm: () => {
          confirmationModal.close();
          adminCreateLessonModal.open({
            initialValues: {
              start: start.toISOString(),
              boardId: selectedBoardId,
              trainerId: props.trainerId,
            },
            overrideAvailability: true,
          });
        },
      });
      return;
    }

    adminCreateLessonModal.open({
      initialValues: {
        start: start.toISOString(),
        boardId: selectedBoardId,
        trainerId: props.trainerId,
      },
    });
  };

  const contextMenuItems = (start: Date) => (
    <>
      <ContextMenuItem onClick={() => handleClick(start)}>
        <CalendarPlusIcon />
        Add lesson
      </ContextMenuItem>
      <ContextMenuItem
        onClick={() =>
          createTimeBlockModal.open({
            start: start.toISOString(),
            trainerId: props.trainerId,
          })
        }
      >
        <ClockIcon />
        Add time block
      </ContextMenuItem>
    </>
  );

  return (
    <HourCellShell
      {...props}
      onClick={handleClick}
      showContextMenu
      contextMenuItems={contextMenuItems}
    />
  );
}
