import type { types } from "@instride/api";
import { cva } from "class-variance-authority";
import { format, parseISO } from "date-fns";
import { ClockIcon, TextIcon, UserIcon } from "lucide-react";

import { getTrainerColor } from "@/features/calendar/utils/lesson";
import { viewLessonModalHandler } from "@/features/lessons/components/modals/view-lesson";
import { DialogTrigger } from "@/shared/components/ui/dialog";

const agendaLessonCardVariants = cva(
  "flex select-none items-center justify-between gap-3 rounded-md border p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
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
        gray: "border-neutral-200 bg-neutral-50 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 [&_.event-dot]:fill-neutral-600",
      },
    },
    defaultVariants: {
      color: "blue",
    },
  }
);

interface AgendaLessonCardProps {
  lesson: types.LessonInstance;
}

export function AgendaLessonCard({ lesson }: AgendaLessonCardProps) {
  const startDate = parseISO(lesson.start);
  const endDate = parseISO(lesson.end);

  const color = lesson.trainerId ? getTrainerColor(lesson.trainerId) : "gray";

  return (
    <DialogTrigger
      handle={viewLessonModalHandler}
      payload={{ lesson }}
      render={
        <div
          role="button"
          tabIndex={0}
          className={agendaLessonCardVariants({ color })}
        />
      }
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <p className="font-medium">
            Lesson with {lesson.trainer?.member?.authUser?.name}
          </p>
        </div>

        <div className="mt-1 flex items-center gap-1">
          <UserIcon className="size-3 shrink-0" />
          <p className="text-xs text-foreground">
            {lesson.trainer?.member?.authUser?.name}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <ClockIcon className="size-3 shrink-0" />
          <p className="text-xs text-foreground">
            {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <TextIcon className="size-3 shrink-0" />
          <p className="text-xs text-foreground">
            {lesson.notes ?? "No notes"}
          </p>
        </div>
      </div>
    </DialogTrigger>
  );
}
