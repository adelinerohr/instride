import type { LessonInstanceWithEnrollment, TimeBlock } from "@instride/shared";

import { useCalendar } from "../../hooks/use-calendar";
import { getEventBlockStyle } from "../../utils/event-block-style";
import { EventBlock, TimeBlockCard } from "./event-block";

interface RenderGroupedEventsProps {
  groupedEvents: LessonInstanceWithEnrollment[][];
  groupedBlocks: TimeBlock[][];
  day: Date;
  services: { id: string; name: string }[];
}

export function RenderGroupedEvents({
  groupedEvents,
  groupedBlocks,
  day,
  services,
}: RenderGroupedEventsProps) {
  const { trainers, navigate } = useCalendar();

  return (
    <>
      {groupedEvents.map((lane, laneIndex) =>
        lane.map((event) => {
          const style = getEventBlockStyle(
            new Date(event.start),
            day,
            laneIndex,
            groupedEvents.length
          );
          return (
            <div key={event.id} className="absolute p-0.5" style={style}>
              <EventBlock
                event={event}
                trainers={trainers}
                services={services}
                onClick={() => navigate({ lessonId: event.id })}
              />
            </div>
          );
        })
      )}
      {groupedBlocks.map((lane, laneIndex) =>
        lane.map((block) => {
          const style = getEventBlockStyle(
            new Date(block.start),
            day,
            laneIndex,
            groupedBlocks.length
          );
          const trainer = trainers.find((m) => m.id === block.trainerMemberId);
          return (
            <div key={block.id} className="absolute p-0.5" style={style}>
              <TimeBlockCard
                block={block}
                trainer={trainer}
                onClick={() => navigate({ timeBlockId: block.id })}
              />
            </div>
          );
        })
      )}
    </>
  );
}
