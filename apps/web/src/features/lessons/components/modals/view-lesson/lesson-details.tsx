import type { types } from "@instride/api";
import { getUser } from "@instride/shared";
import { differenceInMinutes, format } from "date-fns";
import { CalendarIcon, CircleIcon, ClipboardIcon } from "lucide-react";

import { UserAvatarItem } from "@/shared/components/fragments/user-avatar";
import { Badge } from "@/shared/components/ui/badge";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/shared/components/ui/item";

type LessonDetailsProps = {
  instance: types.LessonInstance;
};

export function LessonDetails({ instance }: LessonDetailsProps) {
  if (!instance.trainer) return null;

  const trainer = getUser({ trainer: instance.trainer });

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
          <UserAvatarItem user={trainer} variant="outline" size="default" />
        </DetailSection>
      )}

      <DetailSection label="Details">
        <Item variant="outline">
          <ItemMedia variant="icon">
            <CalendarIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{format(start, "EEEE, MMMM d, yyyy")}</ItemTitle>
            <div className="flex items-center gap-2">
              <ItemDescription>
                {format(start, "h:mm")} - {format(end, "h:mm a")}
              </ItemDescription>
              <Badge variant="secondary">
                {formatDuration(differenceInMinutes(end, start))}
              </Badge>
            </div>
          </ItemContent>
        </Item>
        <Item variant="outline">
          <ItemMedia variant="icon">
            <ClipboardIcon />
          </ItemMedia>
          <ItemContent>
            <div className="flex items-center gap-2 justify-between">
              <ItemTitle>Service: {instance.service?.name}</ItemTitle>
              {instance.level && (
                <Badge variant="secondary">
                  <CircleIcon
                    stroke={instance.level.color}
                    fill={instance.level.color}
                  />
                  {instance.level.name}
                </Badge>
              )}
            </div>
            <ItemDescription>
              On the {instance.board?.name} board
            </ItemDescription>
          </ItemContent>
        </Item>
      </DetailSection>
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
