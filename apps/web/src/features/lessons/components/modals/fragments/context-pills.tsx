import type { TrainerSummary } from "@instride/api";
import { formatInTimeZone } from "date-fns-tz";
import { CalendarIcon, HomeIcon } from "lucide-react";

import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import { cn } from "@/shared/lib/utils";

interface ContextPillsProps {
  startDate: Date;
  timezone: string;
  boardName?: string;
  trainer?: TrainerSummary | null;
  trainerPending: boolean;
}

export function ContextPills({
  startDate,
  timezone,
  boardName,
  trainer,
  trainerPending,
}: ContextPillsProps) {
  return (
    <div className="grid grid-cols-[0.8fr_0.8fr_1fr] gap-2 rounded-md border bg-muted divide-x">
      <Pill
        icon={<CalendarIcon className="size-4 text-muted-foreground" />}
        label={formatInTimeZone(
          startDate,
          timezone,
          "EEE, MMM d"
        ).toUpperCase()}
        value={formatInTimeZone(startDate, timezone, "h:mm a")}
      />
      <Pill
        icon={<HomeIcon className="size-4 text-muted-foreground" />}
        label="BOARD"
        value={boardName ?? "—"}
      />
      <Pill
        icon={
          trainer ? (
            <UserAvatar user={trainer.member.authUser} size="sm" />
          ) : null
        }
        label="TRAINER"
        value={trainer?.member.authUser.name ?? "—"}
        muted={trainerPending}
      />
    </div>
  );
}

function Pill({
  icon,
  label,
  value,
  muted,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2 p-3", muted && "opacity-60")}>
      {icon}
      <div className="min-w-0">
        <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-sm font-medium font-display">{value}</div>
      </div>
    </div>
  );
}
