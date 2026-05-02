import { getUser, type LessonInstance } from "@instride/api";
import { cva, type VariantProps } from "class-variance-authority";
import { differenceInMinutes, format, parseISO } from "date-fns";
import { ClipboardListIcon, ClockIcon, UserIcon } from "lucide-react";
import * as React from "react";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { ViewLessonSheet } from "@/features/lessons/components/modals/view/sheet";
import { Badge } from "@/shared/components/ui/badge";
import { getTrainerColor } from "@/shared/lib/config/colors";
import { cn } from "@/shared/lib/utils";

const lessonBlockVariants = cva(
  "flex select-none flex-col truncate whitespace-nowrap rounded-md border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  {
    variants: {
      color: {
        amber:
          "border-category-amber-border bg-category-amber-bg text-category-amber-fg",
        sage: "border-category-sage-border bg-category-sage-bg text-category-sage-fg",
        slate:
          "border-category-slate-border bg-category-slate-bg text-category-slate-fg",
        terracotta:
          "border-category-terracotta-border bg-category-terracotta-bg text-category-terracotta-fg",
        plum: "border-category-plum-border bg-category-plum-bg text-category-plum-fg",
        clay: "border-category-clay-border bg-category-clay-bg text-category-clay-fg",
      },
      density: {
        comfortable: "gap-0.5 px-2 py-1.5 text-xs",
        compact: "gap-0 px-2 py-1 text-xs",
        tight: "gap-0 px-1.5 py-1 text-[11px] leading-tight justify-start",
        minimal: "gap-0 px-1.5 py-1 text-[11px] leading-none justify-center",
      },
    },
    defaultVariants: { color: "amber", density: "comfortable" },
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

interface LessonBlockProps
  extends
    React.ComponentProps<"div">,
    Omit<VariantProps<typeof lessonBlockVariants>, "color" | "density"> {
  lesson: LessonInstance;
}

export function LessonBlock({ lesson, className }: LessonBlockProps) {
  const { slotHeight, type } = useCalendar();
  const viewLessonSheet = ViewLessonSheet.useModal();

  const start = parseISO(lesson.start);
  const end = parseISO(lesson.end);
  const durationInMinutes = differenceInMinutes(end, start);
  const heightInPixels = (durationInMinutes / 60) * slotHeight - 8;

  const color = lesson.trainer ? getTrainerColor(lesson.trainer.id) : "amber";
  const trainer = lesson.trainer ? getUser({ trainer: lesson.trainer }) : null;
  const isPrivate = lesson.maxRiders === 1;
  const lessonTypeLabel = isPrivate ? "Private" : "Group";

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

  const density = getDensity(size.height);
  const useFullName = size.width >= DENSE_WIDTH;

  const trainerDisplayName = trainer
    ? useFullName
      ? trainer.name
      : abbreviateName(trainer.name)
    : null;

  const handleClick = () => {
    viewLessonSheet.open({
      instanceId: lesson.id,
      isKiosk: type === "kiosk" ? true : false,
    });
  };

  return (
    <div
      ref={blockRef}
      role="button"
      tabIndex={0}
      className={cn(
        lessonBlockVariants({ color, density, className }),
        "cursor-pointer"
      )}
      style={{ height: `${heightInPixels}px` }}
      onClick={handleClick}
    >
      {density === "comfortable" || density === "compact" ? (
        <>
          <div className="flex items-center gap-1.5 truncate">
            <p className="truncate font-semibold">{lesson.service?.name}</p>
            {isPrivate && density === "comfortable" && (
              <Badge variant="outline">Private</Badge>
            )}
          </div>

          {size.width >= TIGHT_WIDTH && (
            <div className="flex items-center gap-1.5">
              <ClockIcon className="size-3 shrink-0" />
              <p className="truncate">
                {format(start, "h:mm")} - {format(end, "h:mm a")}
              </p>
            </div>
          )}

          {trainer && size.width >= TIGHT_WIDTH && trainerDisplayName && (
            <div className="flex items-center gap-1.5">
              <UserIcon className="size-3 shrink-0" />
              <p className="truncate">{trainerDisplayName}</p>
            </div>
          )}

          {!isPrivate && density === "comfortable" && (
            <div className="flex items-center gap-1.5">
              <ClipboardListIcon className="size-3 shrink-0" />
              <p className="truncate">
                {lesson.enrollments?.length} / {lesson.service?.maxRiders}{" "}
                riders
              </p>
            </div>
          )}
        </>
      ) : density === "tight" ? (
        <p className="truncate font-medium">
          {trainerDisplayName ? (
            <>
              {trainerDisplayName}
              <span className="opacity-60"> — </span>
              {lessonTypeLabel}
            </>
          ) : (
            lessonTypeLabel
          )}
        </p>
      ) : (
        <p className="truncate font-medium text-center">
          {size.width >= TIGHT_WIDTH && trainerDisplayName
            ? `${trainerDisplayName} — ${lessonTypeLabel}`
            : lessonTypeLabel}
        </p>
      )}
    </div>
  );
}
