import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { QUARTER_HEIGHT, SLOT_HEIGHT } from "@/features/calendar/lib/constants";
import { confirmationModalHandler } from "@/shared/components/confirmation-modal";
import { cn } from "@/shared/lib/utils";

interface HourCellProps {
  isDisabled: boolean;
  index: number;
  day: Date;
  hour: number;
}

export function HourCell({ isDisabled, index, day, hour }: HourCellProps) {
  const { createLesson, selectedBoardId, selectedTrainerIds } = useCalendar();

  const getStart = (quarter: 0 | 1 | 2 | 3) => {
    const start = new Date(day);
    start.setHours(hour, quarter * 15, 0, 0);
    return start;
  };

  const handleClick = (quarter: 0 | 1 | 2 | 3) => {
    if (isDisabled) {
      confirmationModalHandler.openWithPayload({
        title: "This hour is out of business hours",
        description: "Would you like to book this lesson anyway?",
        confirmLabel: "Yes, create lesson",
        cancelLabel: "No, go back",
        onConfirm: () => {
          const start = getStart(quarter);
          createLesson(
            start,
            selectedBoardId ?? "",
            selectedTrainerIds[0] ?? ""
          );
        },
      });
    } else {
      const start = getStart(quarter);
      createLesson(start, selectedBoardId ?? "", selectedTrainerIds[0] ?? "");
    }
  };

  return (
    <div
      className={cn("relative", isDisabled && "bg-calendar-disabled-hour")}
      style={{ height: `${SLOT_HEIGHT}px` }}
    >
      {index !== 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-0 border-b"></div>
      )}

      <QuarterCell isDisabled={isDisabled} quarter={0} onClick={handleClick} />

      <QuarterCell isDisabled={isDisabled} quarter={1} onClick={handleClick} />

      <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed"></div>

      <QuarterCell isDisabled={isDisabled} quarter={2} onClick={handleClick} />

      <QuarterCell isDisabled={isDisabled} quarter={3} onClick={handleClick} />
    </div>
  );
}

function QuarterCell({
  isDisabled,
  quarter,
  onClick,
}: {
  isDisabled: boolean;
  quarter: 0 | 1 | 2 | 3;
  onClick: (quarter: 0 | 1 | 2 | 3) => void;
}) {
  return (
    <div
      className={cn(
        "cursor-pointer hover:bg-accent/20",
        isDisabled && "cursor-not-allowed"
      )}
      style={{ height: `${QUARTER_HEIGHT}px` }}
      onClick={() => onClick(quarter)}
    >
      <div
        className="absolute inset-x-0 cursor-pointer transition-colors hover:bg-accent"
        style={{
          top: `${quarter * QUARTER_HEIGHT}px`,
          height: `${QUARTER_HEIGHT}px`,
        }}
      />
    </div>
  );
}
