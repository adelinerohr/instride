import type { types } from "@instride/api";
import { isWorkingHour } from "@instride/shared";
import {
  areIntervalsOverlapping,
  differenceInMinutes,
  format,
  isSameDay,
  parseISO,
} from "date-fns";
import * as React from "react";

import { viewLessonModalHandler } from "@/features/lessons/components/modals/view-lesson";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { SheetTrigger } from "@/shared/components/ui/sheet";
import { cn } from "@/shared/lib/utils";

import { useCalendar } from "../../hooks/use-calendar";
import {
  HOURS,
  MOBILE_SLOT_HEIGHT,
  SLOT_HEIGHT,
  START_HOUR,
} from "../../lib/constants";
import {
  getLessonBlockStyle,
  getTrainerColor,
  groupLessons,
} from "../../utils/lesson";
import { HourCell } from "../views/fragments/hour-cell";
import { LessonBlock } from "../views/fragments/lesson-block";
import { CalendarTimeline } from "../views/fragments/timeline";

const lessonBlockColors = {
  amber:
    "border-category-amber-border bg-category-amber-bg text-category-amber-fg",
  sage: "border-category-sage-border bg-category-sage-bg text-category-sage-fg",
  slate:
    "border-category-slate-border bg-category-slate-bg text-category-slate-fg",
  terracotta:
    "border-category-terracotta-border bg-category-terracotta-bg text-category-terracotta-fg",
  plum: "border-category-plum-border bg-category-plum-bg text-category-plum-fg",
  clay: "border-category-clay-border bg-category-clay-bg text-category-clay-fg",
};

export function MobileDayView() {
  const { selectedDate, lessons, selectedTrainerIds, trainerBusinessHours } =
    useCalendar();

  const currentTrainerBusinessHours =
    trainerBusinessHours[selectedTrainerIds[0]];

  const groupedLessons = groupLessons(
    lessons.filter((lesson) => lesson.trainer?.id === selectedTrainerIds[0])
  );

  // Scroll to "now" on mount / selected date change
  const scrollRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const now = new Date();
    const targetHour = isSameDay(now, selectedDate) ? now.getHours() : 9;
    const offset = Math.max(0, (targetHour - START_HOUR - 1) * SLOT_HEIGHT);
    scrollRef.current?.scrollTo({ top: offset, behavior: "smooth" });
  }, [selectedDate]);

  return (
    <ScrollArea className="h-full" ref={scrollRef}>
      <div className="relative flex">
        {/* Hour labels */}
        <div className="w-14 shrink-0">
          {HOURS.map((hour, index) => (
            <div
              key={hour}
              className="relative"
              style={{ height: `${SLOT_HEIGHT}px` }}
            >
              {index !== 0 && (
                <span className="absolute -top-2 right-2 text-xs text-muted-foreground">
                  {format(new Date().setHours(hour, 0, 0, 0), "h a")}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Day timeline */}
        <div className="relative flex-1 border-l">
          {HOURS.map((hour, index) => {
            const isDisabled = !isWorkingHour({
              day: selectedDate,
              hour,
              businessHours: currentTrainerBusinessHours,
            });

            return (
              <HourCell
                key={hour}
                isDisabled={isDisabled}
                index={index}
                day={selectedDate}
                hour={hour}
              />
            );
          })}

          {groupedLessons.map((group, groupIndex) =>
            group.map((lesson) => {
              let style = getLessonBlockStyle(
                lesson,
                selectedDate,
                groupIndex,
                groupedLessons.length
              );
              const hasOverlap = groupedLessons.some(
                (otherGroup, otherIndex) =>
                  otherIndex !== groupIndex &&
                  otherGroup.some((otherLesson) =>
                    areIntervalsOverlapping(
                      {
                        start: parseISO(lesson.start),
                        end: parseISO(lesson.end),
                      },
                      {
                        start: parseISO(otherLesson.start),
                        end: parseISO(otherLesson.end),
                      }
                    )
                  )
              );

              if (!hasOverlap) style = { ...style, width: "100%", left: "0%" };

              return (
                <div key={lesson.id} className="absolute p-1" style={style}>
                  <LessonBlock lesson={lesson} />
                </div>
              );
            })
          )}

          {/* Current time indicator (only when viewing today) */}
          {isSameDay(selectedDate, new Date()) && <CalendarTimeline />}
        </div>
      </div>
    </ScrollArea>
  );
}

interface MobileLessonBlockProps {
  lesson: types.LessonInstance;
  day: Date;
}

function MobileLessonBlock({ lesson, day }: MobileLessonBlockProps) {
  const start = parseISO(lesson.start);
  const end = parseISO(lesson.end);
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);

  const startMinutes = differenceInMinutes(start, dayStart);
  const duration = differenceInMinutes(end, start);
  const visibleStartMinutes = START_HOUR * 60;

  const top = ((startMinutes - visibleStartMinutes) / 60) * MOBILE_SLOT_HEIGHT;
  const height = (duration / 60) * MOBILE_SLOT_HEIGHT - 4;

  const color = lesson.trainer ? getTrainerColor(lesson.trainer.id) : "amber";
  const trainerName = lesson.trainer?.member?.authUser?.name;

  return (
    <SheetTrigger
      handle={viewLessonModalHandler}
      payload={{ lesson }}
      nativeButton={false}
      render={
        <button
          type="button"
          className={cn(
            "absolute inset-x-2 flex flex-col gap-0.5 overflow-hidden rounded-md border px-2 py-1.5 text-left text-xs",
            lessonBlockColors[color]
          )}
          style={{ top, height: Math.max(height, 32) }}
        />
      }
    >
      <span className="truncate font-semibold">{lesson.service?.name}</span>
      <span className="truncate text-[11px] opacity-80">
        {format(start, "h:mm a")} – {format(end, "h:mm a")}
        {trainerName && ` · ${trainerName}`}
      </span>
    </SheetTrigger>
  );
}

function MobileTimeline() {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = now.getHours();
  if (currentHour < START_HOUR) return null;

  const minutes = currentHour * 60 + now.getMinutes();
  const top = ((minutes - START_HOUR * 60) / 60) * MOBILE_SLOT_HEIGHT;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-20 border-t border-accent"
      style={{ top }}
    >
      <div className="absolute left-0 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
    </div>
  );
}
