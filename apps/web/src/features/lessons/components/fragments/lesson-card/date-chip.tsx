import { getUser, type types } from "@instride/api";
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

export function DateChipLessonCard(
  props: LessonCardVariantProps & { showDate?: boolean }
) {
  const getRosterStatus = (lesson: types.LessonInstance) => {
    if (!lesson.enrollments || lesson.enrollments.length === 0) {
      return { checkedIn: [], notCheckedIn: [] };
    }

    const checkedIn = [];
    const notCheckedIn = [];

    for (const enrollment of lesson.enrollments) {
      if (!enrollment.rider) continue;
      if (enrollment.attended) {
        checkedIn.push(getUser({ rider: enrollment.rider }));
      } else {
        notCheckedIn.push(getUser({ rider: enrollment.rider }));
      }
    }

    return { checkedIn, notCheckedIn };
  };

  const openSlots =
    props.lesson.maxRiders - (props.lesson.enrollments?.length ?? 0);

  return (
    <div className="grid grid-cols-10 gap-4">
      <div className="col-span-1 flex items-start justify-center">
        {props.showDate && (
          <div className="flex flex-col items-center justify-center bg-muted py-2 px-3 rounded-md">
            <span className="text-xs leading-none uppercase text-muted-foreground">
              {format(props.lesson.start, "EEE")}
            </span>
            <span className="text-xl font-bold font-display">
              {format(props.lesson.start, "d")}
            </span>
          </div>
        )}
      </div>
      <div className="col-span-9 flex items-center gap-4">
        <div
          className={cn(
            "h-full w-1 bg-primary rounded-full",
            props.lesson.level
              ? categoryColorClasses(
                  (props.lesson.level?.color as CategoryColor) ?? "clay"
                )
              : undefined
          )}
        />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-lg">{props.lessonTitle}</span>
              <LevelBadge level={props.lesson.level} />
            </div>
          </div>
          <TagGroup>
            <Tag icon={ClockIcon}>
              {props.startTime} - {props.endTime}
            </Tag>
            <Tag icon={UserIcon}>{props.trainerUser.name}</Tag>
            {props.type === "portal" && (
              <Tag className="font-medium">{props.riderUser.name}</Tag>
            )}
          </TagGroup>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <div className="flex flex-col items-end">
            <span className="text-xs">
              {props.lesson.enrollments?.length ?? 0}/{props.lesson.maxRiders}
            </span>
            <span className="text-xs text-muted-foreground">
              {openSlots} open
            </span>
          </div>
          <Button
            variant="ghost"
            size={props.type === "portal" ? "sm" : "icon"}
            onClick={() =>
              viewLessonModalHandler.openWithPayload({ lesson: props.lesson })
            }
          >
            {props.type === "portal" && "Details"}
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
