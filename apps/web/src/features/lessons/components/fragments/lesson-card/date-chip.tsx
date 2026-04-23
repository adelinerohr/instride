import { format } from "date-fns";
import { ChevronRightIcon, ClockIcon, UserIcon } from "lucide-react";

import { LevelBadge } from "@/features/organization/components/levels/level-badge";
import { Button } from "@/shared/components/ui/button";
import { Tag, TagGroup } from "@/shared/components/ui/tag";
import {
  categoryColorClasses,
  type CategoryColor,
} from "@/shared/lib/config/colors";
import { cn } from "@/shared/lib/utils";

import type { LessonCardVariantProps } from ".";
import { viewLessonModalHandler } from "../../modals/view-lesson";

export function LessonCardDateChip({ data }: LessonCardVariantProps) {
  const {
    lesson,
    startTime,
    endTime,
    lessonTitle,
    trainerUser,
    riderUser,
    openSlots,
  } = data;

  return (
    <div className="col-span-9 flex items-center gap-4">
      <div
        className={cn(
          "h-full w-1 bg-primary rounded-full",
          lesson.level
            ? categoryColorClasses(
                (lesson.level.color as CategoryColor) ?? "clay"
              )
            : undefined
        )}
      />

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-lg">{lessonTitle}</span>
          <LevelBadge level={lesson.level} />
        </div>
        <TagGroup>
          <Tag icon={ClockIcon}>
            {startTime} - {endTime}
          </Tag>
          <Tag icon={UserIcon}>{trainerUser.name}</Tag>
          {riderUser && <Tag className="font-medium">{riderUser.name}</Tag>}
        </TagGroup>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <div className="flex flex-col items-end">
          <span className="text-xs">
            {lesson.enrollments?.length ?? 0}/{lesson.maxRiders}
          </span>
          <span className="text-xs text-muted-foreground">
            {openSlots} open
          </span>
        </div>
        <Button
          variant="ghost"
          size={riderUser ? "sm" : "icon"}
          onClick={() => viewLessonModalHandler.openWithPayload({ lesson })}
        >
          {riderUser && "Details"}
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}

export function DateChip({ day }: { day: Date }) {
  return (
    <div className="flex flex-col items-center justify-center bg-muted py-2 px-3 rounded-md">
      <span className="text-xs leading-none uppercase text-muted-foreground">
        {format(day, "EEE")}
      </span>
      <span className="text-xl font-bold font-display">{format(day, "d")}</span>
    </div>
  );
}
