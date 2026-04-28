import { hasRole, useListLessonInstances } from "@instride/api";
import { MembershipRole } from "@instride/shared";
import { useRouteContext } from "@tanstack/react-router";
import { addDays } from "date-fns";
import { PlusIcon } from "lucide-react";
import * as React from "react";

import {
  LessonCard,
  LessonCardVariant,
} from "@/features/lessons/components/fragments/lesson-card";
import {
  Empty,
  EmptyHeader,
  EmptyDescription,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import {
  Popover,
  PopoverContent,
  PopoverHandler,
} from "@/shared/components/ui/popover";

export const lessonPickerHandler = PopoverHandler.createHandle();

export function LessonPicker() {
  const { member } = useRouteContext({ from: "/org/$slug/(authenticated)" });

  const { from, to } = React.useMemo(() => {
    const now = new Date();
    now.setMinutes(0, 0, 0); // round to top of hour
    return { from: now, to: addDays(now, 14) };
  }, []);

  const { data: upcomingLessons } = useListLessonInstances(from, to);

  const filteredLessons = (upcomingLessons ?? []).filter((lesson) => {
    if (hasRole(member, MembershipRole.ADMIN)) return true;
    if (hasRole(member, MembershipRole.TRAINER)) {
      return lesson.trainerId === member.trainer?.id;
    }
    return false;
  });

  return (
    <Popover handle={lessonPickerHandler}>
      <PopoverContent align="start" side="top" className="p-0 gap-0 w-fit">
        <div className="flex flex-col p-2 border-b">
          <span className="font-semibold font-display">Attach a lesson</span>
          <span className="text-sm text-muted-foreground">
            Pick from upcoming, or propose a new one
          </span>
        </div>
        <div className="p-2 flex flex-col gap-2">
          <div className="w-full bg-background flex gap-2 p-2 rounded-md items-center">
            <div className="size-8 shrink-0 flex items-center justify-center rounded-md bg-primary">
              <PlusIcon className="size-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Propose a new lesson</span>
              <span className="text-xs text-muted-foreground">
                Quick draft &mdash; date, time, etc.
              </span>
            </div>
          </div>
          <span className="text-xs uppercase text-muted-foreground">
            Upcoming lessons
          </span>
          <div className="flex flex-col">
            {filteredLessons.length > 0 ? (
              filteredLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  variant={LessonCardVariant.DATE_CHIP}
                />
              ))
            ) : (
              <Empty className="border border-dashed">
                <EmptyHeader>
                  <EmptyTitle>No upcoming lessons</EmptyTitle>
                  <EmptyDescription>
                    Please propose a new lesson.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
