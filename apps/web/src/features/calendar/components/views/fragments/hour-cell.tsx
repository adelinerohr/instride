import { useCalendar } from "@/features/calendar/hooks/use-calendar";
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
    const start = getStart(quarter);
    createLesson(start, selectedBoardId ?? "", selectedTrainerIds[0] ?? "");
  };

  return (
    <div
      className={cn("relative", isDisabled && "bg-calendar-disabled-hour")}
      style={{ height: "96px" }}
    >
      {index !== 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-0 border-b"></div>
      )}

      <div
        className="h-[24px] cursor-pointer hover:bg-accent/50"
        onClick={() => handleClick(0)}
      >
        <div className="absolute inset-x-0 top-0 h-[24px] cursor-pointer transition-colors hover:bg-accent" />
      </div>

      <div
        className="h-[24px] cursor-pointer hover:bg-accent/50"
        onClick={() => handleClick(1)}
      >
        <div className="absolute inset-x-0 top-[24px] h-[24px] cursor-pointer transition-colors hover:bg-accent" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed"></div>

      <div
        className="h-[24px] cursor-pointer hover:bg-accent/50"
        onClick={() => handleClick(2)}
      >
        <div className="absolute inset-x-0 top-[48px] h-[24px] cursor-pointer transition-colors hover:bg-accent" />
      </div>

      <div
        className="h-[24px] cursor-pointer hover:bg-accent/50"
        onClick={() => handleClick(3)}
      >
        <div className="absolute inset-x-0 top-[72px] h-[24px] cursor-pointer transition-colors hover:bg-accent" />
      </div>
    </div>
  );
}
