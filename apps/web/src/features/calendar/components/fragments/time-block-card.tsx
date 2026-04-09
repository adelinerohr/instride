import { format } from "date-fns";

import { useCalendarSearch } from "../../hooks/use-calendar-search";
import type { PositionedTimeBlock } from "../../lib/types";

type TimeBlockCardProps = {
  item: PositionedTimeBlock;
};

export function TimeBlockCard({ item }: TimeBlockCardProps) {
  const { openBlock } = useCalendarSearch(false);

  return (
    <button
      type="button"
      onClick={() => openBlock(item.id)}
      className="absolute inset-x-1 rounded-md border border-amber-300/60 bg-amber-100/60 p-1 text-left backdrop-blur-[1px] hover:bg-amber-100/80"
      style={{
        top: item.top,
        height: item.height,
      }}
      title={`Block: ${format(item.start, "h:mm a")}–${format(item.end, "h:mm a")}`}
    >
      <div className="truncate text-[11px] font-medium text-amber-900">
        Block
      </div>
    </button>
  );
}
