import { ClockIcon, UsersIcon } from "lucide-react";

import { LevelBadge } from "@/features/organization/components/levels/level-badge";
import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import { Tag } from "@/shared/components/ui/tag";
import { categoryColorClasses } from "@/shared/lib/config/colors";
import { cn } from "@/shared/lib/utils";

import type { LessonCardVariantProps } from ".";

export function LessonCardAgenda({ data }: LessonCardVariantProps) {
  const { lesson, startTime, endTime, lessonTitle, trainerUser, openSlots } =
    data;

  const levelClass = categoryColorClasses(lesson.level?.color);

  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <div
        className={cn(
          "flex p-4 pl-5 gap-4 border-l-5 justify-between",
          levelClass.border
        )}
      >
        <div className="flex flex-col items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-2xl font-display leading-none">
              {lessonTitle}
            </span>
            <Tag icon={ClockIcon}>
              {startTime} - {endTime}
            </Tag>
          </div>
          <div className="flex items-center gap-2">
            <UserAvatar user={trainerUser} size="sm" />
            <span className="text-sm font-medium">{trainerUser.name}</span>
          </div>
        </div>
        <div className="flex flex-col items-end justify-between gap-4">
          <LevelBadge level={lesson.level} />
          <Tag icon={UsersIcon}>
            {lesson.maxRiders - openSlots}/{lesson.maxRiders}
          </Tag>
        </div>
      </div>
    </div>
  );
}
