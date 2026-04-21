import { format } from "date-fns";
import { ChevronRightIcon, ClockIcon, UserIcon } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Tag, TagGroup } from "@/shared/components/ui/tag";
import {
  categoryColorClasses,
  type CategoryColor,
} from "@/shared/lib/config/colors";
import { cn } from "@/shared/lib/utils";

import type { LessonCardVariantProps } from ".";
import { viewLessonModalHandler } from "../../modals/view-lesson";

export function DateChipLessonCard({
  lesson,
  ...props
}: LessonCardVariantProps) {
  return (
    <div className="grid grid-cols-10 gap-4">
      <div className="col-span-1 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center bg-muted py-2 px-3 rounded-md">
          <span className="text-xs leading-none uppercase text-muted-foreground">
            {format(lesson.start, "EEE")}
          </span>
          <span className="text-xl font-bold font-display">
            {format(lesson.start, "d")}
          </span>
        </div>
      </div>
      <div className="col-span-9 flex items-center gap-4">
        <div
          className={cn(
            "h-full w-1 bg-primary rounded-full",
            lesson.level
              ? categoryColorClasses(
                  (lesson.level?.color as CategoryColor) ?? "clay"
                )
              : undefined
          )}
        />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-lg">{props.lessonTitle}</span>
              <Badge
                variant={lesson.level ? "outline" : "secondary"}
                className={
                  lesson.level
                    ? categoryColorClasses(
                        (lesson.level?.color as CategoryColor) ?? "clay"
                      )
                    : undefined
                }
              >
                {lesson.level?.name ?? "Unrestricted"}
              </Badge>
            </div>
          </div>
          <TagGroup>
            <Tag icon={ClockIcon}>
              {props.startTime} - {props.endTime}
            </Tag>
            <Tag icon={UserIcon}>{props.trainerUser.name}</Tag>
            <Tag className="font-medium">{props.riderUser.name}</Tag>
          </TagGroup>
        </div>
        <Button
          variant="ghost"
          className="ml-auto"
          size="sm"
          onClick={() => {
            viewLessonModalHandler.openWithPayload({ lesson });
          }}
        >
          Details
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
