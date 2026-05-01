import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/shared/components/ui/context-menu";
import { cn } from "@/shared/lib/utils";

import type { HourCellProps } from ".";

interface HourCellShellProps extends HourCellProps {
  onClick: (start: Date) => void;
  showContextMenu?: boolean;
  contextMenuItems?: (start: Date) => React.ReactNode;
}

export function HourCellShell({
  isDisabled,
  index,
  day,
  hour,
  onClick,
  showContextMenu = false,
  contextMenuItems,
}: HourCellShellProps) {
  const { slotHeight, halfHeight } = useCalendar();

  const getStart = (half: 0 | 1) => {
    // TODO: this needs the org-tz-aware version we discussed earlier
    const start = new Date(day);
    start.setHours(hour, half * 30, 0, 0);
    return start;
  };

  return (
    <div
      className={cn("relative", isDisabled && "bg-calendar-disabled-hour")}
      style={{ height: `${slotHeight}px` }}
    >
      {index !== 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-0 border-b" />
      )}

      {([0, 1] as const).map((half) => (
        <HalfCell
          key={half}
          showContextMenu={showContextMenu}
          contextMenuItems={() => contextMenuItems?.(getStart(half))}
          half={half}
          isDisabled={isDisabled}
          halfHeight={halfHeight}
          onClick={() => onClick(getStart(half))}
        />
      ))}

      <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed" />
    </div>
  );
}

interface HalfCellProps {
  isDisabled: boolean;
  half: 0 | 1;
  onClick: (half: 0 | 1) => void;
  halfHeight: number;
  showContextMenu?: boolean;
  contextMenuItems?: (half: 0 | 1) => React.ReactNode;
}

function HalfCell({
  isDisabled,
  half,
  onClick,
  halfHeight,
  showContextMenu = false,
  contextMenuItems,
}: HalfCellProps) {
  return (
    <ContextMenu disabled={!showContextMenu}>
      <ContextMenuTrigger>
        <div
          className={cn(
            "cursor-pointer hover:bg-muted/20",
            isDisabled && "cursor-not-allowed"
          )}
          style={{ height: `${halfHeight}px` }}
          onClick={() => onClick(half)}
        >
          <div
            className="absolute inset-x-0 cursor-pointer transition-colors hover:bg-muted/50"
            style={{
              top: `${half * halfHeight}px`,
              height: `${halfHeight}px`,
            }}
          />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {contextMenuItems ? contextMenuItems(half) : undefined}
      </ContextMenuContent>
    </ContextMenu>
  );
}
