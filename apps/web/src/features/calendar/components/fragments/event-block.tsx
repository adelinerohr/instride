import type {
  LessonInstanceWithEnrollment,
  TimeBlock,
  Trainer,
} from "@instride/shared";
import { differenceInMinutes, format } from "date-fns";
import { BanIcon } from "lucide-react";

import { SLOT_HEIGHT } from "../../lib/constants";

interface EventBlockProps {
  event: LessonInstanceWithEnrollment;
  trainers: Trainer[];
  services: { id: string; name: string }[];
  onClick: () => void;
}

export function EventBlock({
  event,
  trainers,
  services,
  onClick,
}: EventBlockProps) {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const durationMinutes = differenceInMinutes(end, start);
  const height = Math.max((durationMinutes / 60) * SLOT_HEIGHT - 4, 20);

  const trainer = trainers.find((m) => m.id === event.trainerMemberId);
  const service = services.find((s) => s.id === event.serviceId);
  const displayName = event.name ?? service?.name ?? "Lesson";

  return (
    <button
      onClick={onClick}
      className="w-full rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-left text-xs hover:bg-primary/20 transition-colors overflow-hidden"
      style={{ height }}
    >
      <div className="truncate font-semibold text-primary">{displayName}</div>
      {durationMinutes > 25 && (
        <div className="truncate text-primary/70">
          {format(start, "h:mm")}–{format(end, "h:mm a")}
        </div>
      )}
      {durationMinutes > 45 && trainer && (
        <div className="truncate text-primary/60">
          {trainer.member.authUser.name}
        </div>
      )}
    </button>
  );
}

interface TimeBlockCardProps {
  block: TimeBlock;
  trainer: Trainer | undefined;
  onClick: () => void;
}

export function TimeBlockCard({ block, trainer, onClick }: TimeBlockCardProps) {
  const start = new Date(block.start);
  const end = new Date(block.end);
  const durationMinutes = differenceInMinutes(end, start);
  const height = Math.max((durationMinutes / 60) * SLOT_HEIGHT - 4, 20);

  return (
    <button
      onClick={onClick}
      className="w-full rounded-md border border-muted-foreground/20 bg-muted px-2 py-1 text-left text-xs hover:bg-muted/80 transition-colors overflow-hidden"
      style={{ height }}
    >
      <div className="flex items-center gap-1 truncate text-muted-foreground font-semibold">
        <BanIcon className="size-3 flex-none" />
        <span>Blocked</span>
      </div>
      {durationMinutes > 25 && trainer && (
        <div className="truncate text-muted-foreground/70">
          {trainer.member.authUser.name}
        </div>
      )}
    </button>
  );
}
