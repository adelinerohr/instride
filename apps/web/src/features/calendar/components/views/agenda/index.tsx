import { ClipboardIcon } from "lucide-react";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { LessonCardList } from "@/features/lessons/components/card";
import { ViewLessonSheet } from "@/features/lessons/components/modals/view/sheet";
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/shared/components/ui/empty";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

export function AgendaView() {
  const { lessons } = useCalendar();
  const viewLessonSheet = ViewLessonSheet.useModal();

  // TODO: Add auto-scroll to current day

  return (
    <ScrollArea className="h-full">
      <LessonCardList
        variant="agenda"
        grouped
        items={lessons.map((lesson) => ({
          lesson,
          perspective: { kind: "admin" },
          onClick: () => viewLessonSheet.open({ instanceId: lesson.id }),
        }))}
        emptyState={
          <Empty className="border border-dashed w-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardIcon />
              </EmptyMedia>
              <EmptyTitle>No lessons</EmptyTitle>
              <EmptyDescription>
                There are no lessons scheduled for this month.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      />
    </ScrollArea>
  );
}
