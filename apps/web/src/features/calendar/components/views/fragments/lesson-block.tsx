import type { types } from "@instride/api";
import { getUser } from "@instride/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { differenceInMinutes, format, parseISO } from "date-fns";
import { ClipboardListIcon, ClockIcon, UserIcon } from "lucide-react";

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
        blue: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 [&_.event-dot]:fill-blue-600",
        green:
          "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300 [&_.event-dot]:fill-green-600",
        red: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 [&_.event-dot]:fill-red-600",
        yellow:
          "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 [&_.event-dot]:fill-yellow-600",
        purple:
          "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300 [&_.event-dot]:fill-purple-600",
        orange:
          "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300 [&_.event-dot]:fill-orange-600",
        gray: "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 [&_.event-dot]:fill-neutral-600",
      },
    },
    defaultVariants: {
      color: "gray",
    },
  }
);

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

  const color = lesson.trainer ? getTrainerColor(lesson.trainer.id) : "gray";

  const weekLessonBlockClasses = cn(
    weekLessonBlockVariants({ color, className }),
    "cursor-pointer"
  );

  const trainer = lesson.trainer ? getUser({ trainer: lesson.trainer }) : null;
  const isPrivate = lesson.maxRiders === 1;

  return (
    <SheetTrigger
      handle={viewLessonModalHandler}
      payload={{ lesson }}
      nativeButton={false}
      render={
        <div
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
      <div className="flex items-center gap-1.5">
        <ClockIcon className="size-3" />
        <p>
          {format(start, "h:mm")} - {format(end, "h:mm a")}
        </p>
      </div>
      {trainer && (
        <div className="flex items-center gap-1.5">
          <UserIcon className="size-3" />
          <p>{trainer.name}</p>
        </div>
      )}
      {!isPrivate && (
        <div className="flex items-center gap-1.5">
          <ClipboardListIcon className="size-3" />
          <p>
            {lesson.enrollments?.length} / {lesson.service?.maxRiders} riders
          </p>
        </div>
      )}
    </SheetTrigger>
  );
}
