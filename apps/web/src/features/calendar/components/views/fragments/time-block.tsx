import { getUser, type TimeBlock } from "@instride/api";
import { cva } from "class-variance-authority";
import { differenceInMinutes, format, parseISO } from "date-fns";
import { AlertCircleIcon, ClockIcon, UserIcon } from "lucide-react";
import * as React from "react";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { cn } from "@/shared/lib/utils";

const timeBlockVariants = cva(
  "flex select-none bg-muted text-muted-foreground flex-col truncate whitespace-nowrap rounded-md border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  {
    variants: {
      density: {
        comfortable: "gap-0.5 px-2 py-1.5 text-xs",
        compact: "gap-0 px-2 py-1 text-xs",
        tight: "gap-0 px-1.5 py-1 text-[11px] leading-tight justify-start",
        minimal: "gap-0 px-1.5 py-1 text-[11px] leading-none justify-center",
      },
    },
    defaultVariants: { density: "comfortable" },
  }
);

const DENSE_WIDTH = 120;
const TIGHT_WIDTH = 90;

const HEIGHT_COMFORTABLE = 72;
const HEIGHT_COMPACT = 52;
const HEIGHT_TIGHT = 34;

type Density = "comfortable" | "compact" | "tight" | "minimal";

function getDensity(height: number): Density {
  if (height >= HEIGHT_COMFORTABLE) return "comfortable";
  if (height >= HEIGHT_COMPACT) return "compact";
  if (height >= HEIGHT_TIGHT) return "tight";
  return "minimal";
}

function abbreviateName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

interface TimeBlockProps {
  timeBlock: TimeBlock;
}

export function TimeBlock({ timeBlock }: TimeBlockProps) {
  const { slotHeight, trainers } = useCalendar();

  const start = parseISO(timeBlock.start);
  const end = parseISO(timeBlock.end);
  const durationInMinutes = differenceInMinutes(end, start);
  const heightInPixels = (durationInMinutes / 60) * slotHeight - 8;

  const blockRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({
    width: Infinity,
    height: heightInPixels,
  });

  React.useEffect(() => {
    const el = blockRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      setSize({ width: rect.width, height: rect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const trainer = trainers.find(
    (trainer) => trainer.id === timeBlock.trainerId
  );

  if (!trainer) return null;

  const trainerUser = getUser({ trainer });

  const density = getDensity(size.height);
  const useFullName = size.width >= DENSE_WIDTH;

  const trainerDisplayName = trainer
    ? useFullName
      ? trainerUser.name
      : abbreviateName(trainerUser.name)
    : null;

  return (
    <div
      ref={blockRef}
      role="button"
      tabIndex={0}
      className={cn(timeBlockVariants({ density }), "cursor-pointer")}
      style={{ height: `${heightInPixels}px` }}
    >
      {density === "comfortable" || density === "compact" ? (
        <>
          <div className="flex items-center gap-1.5 truncate">
            <p className="truncate font-semibold">Time Block</p>
          </div>

          {trainer && size.width >= TIGHT_WIDTH && trainerDisplayName && (
            <div className="flex items-center gap-1.5">
              <UserIcon className="size-3 shrink-0" />
              <p className="truncate">{trainerDisplayName}</p>
            </div>
          )}

          {size.width >= TIGHT_WIDTH && (
            <div className="flex items-center gap-1.5">
              <ClockIcon className="size-3 shrink-0" />
              <p className="truncate">
                {format(start, "h:mm")} - {format(end, "h:mm a")}
              </p>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <AlertCircleIcon className="size-3 shrink-0" />
            <p className="truncate">{timeBlock.reason}</p>
          </div>
        </>
      ) : density === "tight" ? (
        <p className="truncate font-medium">
          {trainerDisplayName ? (
            <>
              {trainerDisplayName}
              <span className="opacity-60"> — </span>
              {timeBlock.reason}
            </>
          ) : (
            timeBlock.reason
          )}
        </p>
      ) : (
        <p className="truncate font-medium text-center">
          {size.width >= TIGHT_WIDTH && trainerDisplayName
            ? `${trainerDisplayName} — ${timeBlock.reason}`
            : timeBlock.reason}
        </p>
      )}
    </div>
  );
}
