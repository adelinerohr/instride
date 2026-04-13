import type { types } from "@instride/api";
import { differenceInMinutes, format } from "date-fns";
import { CalendarIcon, ClipboardIcon } from "lucide-react";

import { UserAvatar } from "@/shared/components/fragments/user-avatar";

type LessonDetailsProps = {
  instance: types.LessonInstance;
};

export function LessonDetails({ instance }: LessonDetailsProps) {
  const authUser = instance.trainer?.member?.authUser;
  const start = new Date(instance.start);
  const end = new Date(instance.end);

  return (
    <div className="flex flex-col gap-4">
      {instance.notes && (
        <DetailSection label="Notes">
          <p className="text-sm">{instance.notes}</p>
        </DetailSection>
      )}

      {instance.trainer && (
        <DetailSection label="Trainer">
          <div className="flex items-center gap-3">
            <UserAvatar user={authUser!} />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{authUser?.name}</span>
              {authUser?.email && (
                <span className="text-xs text-muted-foreground">
                  {authUser?.email}
                </span>
              )}
            </div>
          </div>
        </DetailSection>
      )}

      <DetailRow
        label="Scheduled"
        icon={<CalendarIcon className="size-5" />}
        primary={`${format(start, "MM/dd/yyyy h:mm")} - ${format(end, "h:mm a")}`}
        secondary={formatDuration(differenceInMinutes(end, start))}
      />

      <DetailRow
        label="Service & Board"
        icon={<ClipboardIcon className="size-5" />}
        primary={instance.service?.name}
        secondary={instance.board?.name}
      />
    </div>
  );
}

function DetailSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

type DetailRowProps = {
  label: string;
  icon: React.ReactNode;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
};

function DetailRow({ label, icon, primary, secondary }: DetailRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{primary}</span>
          {secondary && (
            <span className="text-xs text-muted-foreground">{secondary}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDuration(minutes: number) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder > 0
      ? `${hours}h ${remainder}m`
      : `${hours} hour${hours > 1 ? "s" : ""}`;
  }
  return `${minutes} minutes`;
}
