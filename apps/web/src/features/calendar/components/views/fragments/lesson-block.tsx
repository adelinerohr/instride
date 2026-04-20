import { getUser, type types } from "@instride/api";
import { cva, type VariantProps } from "class-variance-authority";
import { differenceInMinutes, format, parseISO } from "date-fns";
import { ClipboardListIcon, ClockIcon, UserIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SLOT_HEIGHT } from "@/features/calendar/lib/constants";
import { getTrainerColor } from "@/features/calendar/utils/lesson";
import { viewLessonModalHandler } from "@/features/lessons/components/modals/view-lesson";
import { Badge } from "@/shared/components/ui/badge";
import { SheetTrigger } from "@/shared/components/ui/sheet";
import { cn } from "@/shared/lib/utils";

const weekLessonBlockVariants = cva(
  "flex select-none flex-col gap-0.5 truncate whitespace-nowrap rounded-md border px-2 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  {
    variants: {
      color: {
        amber:
          "border-category-amber-border bg-category-amber-bg text-category-amber-fg [&_.event-dot]:fill-category-amber-dot",
        sage: "border-category-sage-border bg-category-sage-bg text-category-sage-fg [&_.event-dot]:fill-category-sage-dot",
        slate:
          "border-category-slate-border bg-category-slate-bg text-category-slate-fg [&_.event-dot]:fill-category-slate-dot",
        terracotta:
          "border-category-terracotta-border bg-category-terracotta-bg text-category-terracotta-fg [&_.event-dot]:fill-category-terracotta-dot",
        plum: "border-category-plum-border bg-category-plum-bg text-category-plum-fg [&_.event-dot]:fill-category-plum-dot",
        clay: "border-category-clay-border bg-category-clay-bg text-category-clay-fg [&_.event-dot]:fill-category-clay-dot",
      },
    },
    defaultVariants: { color: "amber" },
  }
);

// Width thresholds in pixels — tune to taste once you see it in context
const DENSE_WIDTH = 120; // below this: abbreviate trainer name
const TIGHT_WIDTH = 90; // below this: also hide the time row

function abbreviateName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0];
  return `${first} ${lastInitial}.`;
}

interface LessonBlockProps
  extends
    React.ComponentProps<"div">,
    Omit<VariantProps<typeof weekLessonBlockVariants>, "color"> {
  lesson: types.LessonInstance;
}

export function LessonBlock({ lesson, className }: LessonBlockProps) {
  const start = parseISO(lesson.start);
  const end = parseISO(lesson.end);
  const durationInMinutes = differenceInMinutes(end, start);
  const heightInPixels = (durationInMinutes / 60) * SLOT_HEIGHT - 8;

  const color = lesson.trainer ? getTrainerColor(lesson.trainer.id) : "amber";
  const trainer = lesson.trainer ? getUser({ trainer: lesson.trainer }) : null;
  const isPrivate = lesson.maxRiders === 1;

  const blockRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(Infinity);

  useEffect(() => {
    const el = blockRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? Infinity;
      setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const showTime = width >= TIGHT_WIDTH;
  const useFullName = width >= DENSE_WIDTH;
  const trainerDisplayName = trainer
    ? useFullName
      ? trainer.name
      : abbreviateName(trainer.name)
    : null;

  const weekLessonBlockClasses = cn(
    weekLessonBlockVariants({ color, className }),
    "cursor-pointer"
  );

  return (
    <SheetTrigger
      handle={viewLessonModalHandler}
      payload={{ lesson }}
      nativeButton={false}
      render={
        <div
          ref={blockRef}
          role="button"
          tabIndex={0}
          className={weekLessonBlockClasses}
          style={{ height: `${heightInPixels}px` }}
        />
      }
    >
      <div className="flex items-center gap-1.5 truncate">
        <p className="truncate font-semibold">{lesson.service?.name}</p>
        {isPrivate && <Badge variant="outline">Private</Badge>}
      </div>
      {showTime && (
        <div className="flex items-center gap-1.5">
          <ClockIcon className="size-3 shrink-0" />
          <p className="truncate">
            {format(start, "h:mm")} - {format(end, "h:mm a")}
          </p>
        </div>
      )}
      {trainerDisplayName && (
        <div className="flex items-center gap-1.5">
          <UserIcon className="size-3 shrink-0" />
          <p className="truncate">{trainerDisplayName}</p>
        </div>
      )}
      {!isPrivate && (
        <div className="flex items-center gap-1.5">
          <ClipboardListIcon className="size-3 shrink-0" />
          <p className="truncate">
            {lesson.enrollments?.length} / {lesson.service?.maxRiders} riders
          </p>
        </div>
      )}
    </SheetTrigger>
  );
}
