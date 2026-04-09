import type { types } from "@instride/api";
import { format } from "date-fns";

import { useCalendarSearch } from "../../hooks/use-calendar-search";
import type { PositionedLesson } from "../../lib/types";

type LessonCardProps = {
  item: PositionedLesson;
  trainer: types.Trainer;
};

export function LessonCard({ item, trainer }: LessonCardProps) {
  const { openLesson } = useCalendarSearch(false);
  const title = item.lesson.name?.trim() ?? "Lesson";
  const enrollment = `${item.lesson.enrollments?.length}/${item.lesson.maxRiders}`;

  return (
    <button
      type="button"
      onClick={() => openLesson(item.lesson.id)}
      className="absolute overflow-hidden rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-left hover:bg-primary/15"
      style={{
        top: item.top,
        height: item.height,
        width: `${item.width}%`,
        left: `${item.left}%`,
      }}
    >
      <div className="truncate text-xs font-semibold text-primary">{title}</div>
      {item.height >= 30 && (
        <div className="truncate text-xs text-primary/80">
          {format(item.start, "h:mm")}-{format(item.end, "h:mm")}
        </div>
      )}

      {item.height >= 46 && trainer && (
        <div className="truncate text-[11px] text-primary/70">
          {trainer.member?.authUser?.name}
        </div>
      )}

      {item.height >= 62 && enrollment && (
        <div className="truncate text-[11px] text-primary/70">
          Riders: {enrollment}
        </div>
      )}
    </button>
  );
}
