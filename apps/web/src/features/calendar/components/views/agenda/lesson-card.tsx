import { getUser, type types } from "@instride/api";
import { cva } from "class-variance-authority";
import { format, parseISO } from "date-fns";
import { ClockIcon, UserIcon, UsersIcon } from "lucide-react";

import { getTrainerColor } from "@/features/calendar/utils/lesson";
import { viewLessonModalHandler } from "@/features/lessons/components/modals/view-lesson";
import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import { AvatarGroup, AvatarGroupCount } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { SheetTrigger } from "@/shared/components/ui/sheet";
import { cn } from "@/shared/lib/utils";

const agendaLessonCardVariants = cva(
  "flex select-none bg-secondary/50 items-center justify-between gap-3 rounded-md border p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  {
    variants: {
      color: {
        blue: "border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300 [&_.event-dot]:fill-blue-600",
        green:
          "border-green-200 text-green-700 dark:border-green-800 dark:text-green-300 [&_.event-dot]:fill-green-600",
        red: "border-red-200 text-red-700 dark:border-red-800 dark:text-red-300 [&_.event-dot]:fill-red-600",
        yellow:
          "border-yellow-200 text-yellow-700 dark:border-yellow-800 dark:text-yellow-300 [&_.event-dot]:fill-yellow-600",
        purple:
          "border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300 [&_.event-dot]:fill-purple-600",
        orange:
          "border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-300 [&_.event-dot]:fill-orange-600",
        gray: "border-neutral-200 text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 [&_.event-dot]:fill-neutral-600",
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

  const riders = (lesson.enrollments ?? [])
    .filter(
      (enrollment): enrollment is typeof enrollment & { rider: types.Rider } =>
        enrollment.rider != null
    )
    .map((enrollment) => getUser({ rider: enrollment.rider }));

  return (
    <SheetTrigger
      handle={viewLessonModalHandler}
      payload={{ lesson }}
      nativeButton={false}
      render={
        <div
          role="button"
          tabIndex={0}
          className={cn(agendaLessonCardVariants({ color }), "cursor-pointer")}
        />
      }
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <p className="font-medium">
            {lesson.name ? lesson.name : lesson.service?.name}
          </p>
          {lesson.level && (
            <Badge variant="outline" className="text-xs">
              {lesson.level.name}
            </Badge>
          )}
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
            {format(startDate, "h:mm")} - {format(endDate, "h:mm a")}
          </p>
        </div>

        {riders.length > 0 ? (
          <div className="flex items-center gap-2">
            <AvatarGroup>
              {riders.slice(0, 3).map((rider) => (
                <UserAvatar key={rider.id} user={rider} size="sm" />
              ))}
              {riders.length > 3 && (
                <AvatarGroupCount>+{riders.length - 3}</AvatarGroupCount>
              )}
            </AvatarGroup>
            <p className="text-xs text-foreground">
              {riders.length} {riders.length === 1 ? "rider" : "riders"}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <UsersIcon className="size-3 shrink-0" />
            <p className="text-xs text-foreground">No riders enrolled yet</p>
          </div>
        )}
      </div>
    </SheetTrigger>
  );
}
