import type { types } from "@instride/api";
import { format, isToday } from "date-fns";

import { cn } from "@/shared/lib/utils";

import { useCalendarSearch } from "../../hooks/use-calendar-search";
import type { AgendaDay } from "../../lib/types";

export interface AgendaViewProps {
  days: AgendaDay[];
  trainersById: Record<string, types.Trainer>;
}

export function AgendaView({ days, trainersById }: AgendaViewProps) {
  const { openLesson, openBlock } = useCalendarSearch(false);

  if (days.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No events this month.
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="divide-y">
        {days.map((day) => (
          <section key={day.date.toISOString()} className="bg-background">
            <div className="sticky top-0 z-10 border-b bg-background/95 px-4 py-2 backdrop-blur">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                    isToday(day.date) && "bg-primary text-primary-foreground"
                  )}
                >
                  {format(day.date, "d")}
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    {format(day.date, "EEEE")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(day.date, "MMMM d, yyyy")}
                  </div>
                </div>
              </div>
            </div>

            <div className="divide-y">
              {day.items.map((item) => {
                if (item.type === "lesson") {
                  const trainer = trainersById[item.lesson.trainerMemberId];
                  const title = item.lesson.name?.trim() || "Lesson";

                  const enrollment = `${item.lesson.enrollments?.length}/${item.lesson.maxRiders}`;

                  return (
                    <button
                      key={`lesson-${item.id}`}
                      type="button"
                      onClick={() => openLesson(item.id)}
                      className="flex w-full items-start gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="w-24 flex-none text-sm text-muted-foreground">
                        {format(item.start, "h:mm a")}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {title}
                        </div>

                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {trainer && (
                            <span>{trainer.member?.authUser?.name}</span>
                          )}
                          {enrollment && <span>Riders: {enrollment}</span>}
                        </div>
                      </div>
                    </button>
                  );
                }

                const trainer = trainersById[item.block.trainerId];

                return (
                  <button
                    key={`block-${item.id}`}
                    type="button"
                    onClick={() => openBlock(item.id)}
                    className="flex w-full items-start gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="w-24 flex-none text-sm text-muted-foreground">
                      {format(item.start, "h:mm a")}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-amber-900">
                        Blocked
                      </div>

                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {trainer && (
                          <span>{trainer.member?.authUser?.name}</span>
                        )}
                        <span>
                          {format(item.start, "h:mm a")}–
                          {format(item.end, "h:mm a")}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
