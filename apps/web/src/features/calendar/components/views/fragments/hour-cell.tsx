import { useRouteContext } from "@tanstack/react-router";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { actAsModalHandler } from "@/features/kiosk/components/act-as-modal";
import { KioskScope } from "@/features/kiosk/lib/types";
import { confirmationModalHandler } from "@/shared/components/confirmation-modal";
import { cn } from "@/shared/lib/utils";

interface HourCellProps {
  isDisabled: boolean;
  index: number;
  day: Date;
  hour: number;
}

export function HourCell({ isDisabled, index, day, hour }: HourCellProps) {
  const {
    createLesson,
    selectedBoardId,
    selectedTrainerIds,
    type,
    slotHeight,
    quarterHeight,
  } = useCalendar();
  const { kioskPermissions, kioskSession } = useRouteContext({ strict: false });

  const getStart = (quarter: 0 | 1 | 2 | 3) => {
    const start = new Date(day);
    start.setHours(hour, quarter * 15, 0, 0);
    return start;
  };

  const handleClick = (quarter: 0 | 1 | 2 | 3) => {
    if (kioskSession && kioskSession.scope !== KioskScope.DEFAULT) {
      actAsModalHandler.open(null);
    }

    if (kioskPermissions && !kioskPermissions.canCreateLesson) {
      return;
    }

    if (
      isDisabled &&
      (type === "admin" ||
        (type === "kiosk" && kioskSession?.scope === KioskScope.STAFF))
    ) {
      confirmationModalHandler.openWithPayload({
        title: "This hour is out of business hours",
        description: "Would you like to book this lesson anyway?",
        confirmLabel: "Yes, create lesson",
        cancelLabel: "No, go back",
        onConfirm: () => {
          const start = getStart(quarter);
          confirmationModalHandler.close();
          createLesson({
            start: start.toISOString(),
            boardId: selectedBoardId,
            trainerId: selectedTrainerIds[0],
            overrideBusinessHours: true,
          });
        },
      });
    } else {
      const start = getStart(quarter);
      createLesson({
        start: start.toISOString(),
        boardId: selectedBoardId,
        trainerId: selectedTrainerIds[0],
      });
    }
  };

  return (
    <div
      className={cn("relative", isDisabled && "bg-calendar-disabled-hour")}
      style={{ height: `${slotHeight}px` }}
    >
      {index !== 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-0 border-b"></div>
      )}

      <QuarterCell
        isDisabled={isDisabled}
        quarter={0}
        onClick={handleClick}
        quarterHeight={quarterHeight}
      />

      <QuarterCell
        isDisabled={isDisabled}
        quarter={1}
        onClick={handleClick}
        quarterHeight={quarterHeight}
      />

      <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed"></div>

      <QuarterCell
        isDisabled={isDisabled}
        quarter={2}
        onClick={handleClick}
        quarterHeight={quarterHeight}
      />

      <QuarterCell
        isDisabled={isDisabled}
        quarter={3}
        onClick={handleClick}
        quarterHeight={quarterHeight}
      />
    </div>
  );
}

function QuarterCell({
  isDisabled,
  quarter,
  onClick,
  quarterHeight,
}: {
  isDisabled: boolean;
  quarter: 0 | 1 | 2 | 3;
  onClick: (quarter: 0 | 1 | 2 | 3) => void;
  quarterHeight: number;
}) {
  return (
    <div
      className={cn(
        "cursor-pointer hover:bg-muted/20",
        isDisabled && "cursor-not-allowed"
      )}
      style={{ height: `${quarterHeight}px` }}
      onClick={() => onClick(quarter)}
    >
      <div
        className="absolute inset-x-0 cursor-pointer transition-colors hover:bg-muted/50"
        style={{
          top: `${quarter * quarterHeight}px`,
          height: `${quarterHeight}px`,
        }}
      />
    </div>
  );
}
