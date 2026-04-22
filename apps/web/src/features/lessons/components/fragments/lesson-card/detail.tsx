import { getUser, type types } from "@instride/api";
import { isAfter, isBefore } from "date-fns";
import {
  ArrowRightIcon,
  CheckIcon,
  CircleCheckIcon,
  ClockIcon,
  EditIcon,
  MapPinIcon,
  PlusIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

import { LevelBadge } from "@/features/organization/components/levels/level-badge";
import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { Tag, TagGroup } from "@/shared/components/ui/tag";

import type { LessonCardVariantProps } from ".";
import { viewLessonModalHandler } from "../../modals/view-lesson";

export function LessonCardDetail(props: LessonCardVariantProps) {
  const isLessonOngoing =
    isAfter(new Date(), props.lesson.start) &&
    isBefore(new Date(), props.lesson.end);

  const getRosterStatus = (lesson: types.LessonInstance) => {
    if (!lesson.enrollments || lesson.enrollments.length === 0) {
      return { checkedIn: [], notCheckedIn: [] };
    }

    const checkedIn = [];
    const notCheckedIn = [];

    for (const enrollment of lesson.enrollments) {
      if (!enrollment.rider) continue;
      if (enrollment.attended) {
        checkedIn.push(getUser({ rider: enrollment.rider }));
      } else {
        notCheckedIn.push(getUser({ rider: enrollment.rider }));
      }
    }

    return { checkedIn, notCheckedIn };
  };

  const openSlots =
    props.lesson.maxRiders - (props.lesson.enrollments?.length ?? 0);

  return (
    <div className="flex flex-col p-4 gap-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <Badge variant={isLessonOngoing ? "destructive" : "slate"}>
          {isLessonOngoing ? (
            <div className="rounded-full size-2 bg-destructive" />
          ) : (
            <ArrowRightIcon />
          )}
          {isLessonOngoing ? "Happening now" : "Up next"}
        </Badge>
        <span className="text-xs text-primary">
          {props.startTime} &middot; {props.duration}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="font-display text-2xl">
          {props.isPrivate ? "Private" : "Group"} &mdash; {props.lessonTitle}
        </div>
        <div className="flex items-center gap-1">
          <LevelBadge level={props.lesson.level} />
          <Badge variant="secondary">
            {props.isPrivate ? <UserIcon /> : <UsersIcon />}
            {props.isPrivate ? "Private" : "Group"}
          </Badge>
        </div>
      </div>
      <TagGroup className="grid grid-cols-3 gap-2">
        <Tag icon={UserIcon}>{props.trainerUser.name}</Tag>
        <Tag icon={ClockIcon}>
          {props.startTime} - {props.endTime}
        </Tag>
        <Tag icon={MapPinIcon}>{props.lesson.board?.name}</Tag>
      </TagGroup>
      {props.type === "portal" ? (
        <div className="flex items-center gap-2 w-full border rounded-md p-2">
          <UserAvatar user={props.riderUser} />
          <div className="flex flex-col">
            <span className="font-medium text-lg">{props.riderUser.name}</span>
            <span className="text-sm text-muted-foreground">
              {props.riderUser.email}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 justify-between">
            <span className="text-xs text-primary font-medium">
              Roster &middot; {props.lesson.enrollments?.length}/
              {props.lesson.maxRiders}
            </span>
            <span className="text-muted-foreground font-medium text-xs">
              {getRosterStatus(props.lesson).checkedIn.length} of{" "}
              {props.lesson.maxRiders} checked in
            </span>
          </div>
          <div className="flex gap-2">
            {getRosterStatus(props.lesson).checkedIn.map((user) => (
              <div className="rounded-full border p-1 pr-2 flex items-center gap-2">
                <UserAvatar user={user} size="xs" />
                <span className="text-xs font-medium">{user.name}</span>
                <CheckIcon className="size-3 text-muted-foreground" />
              </div>
            ))}
            {getRosterStatus(props.lesson).notCheckedIn.map((user) => (
              <div className="rounded-full border p-1 pr-2 flex items-center gap-2">
                <UserAvatar user={user} size="xs" />
                <span className="text-xs font-medium">{user.name}</span>
              </div>
            ))}
            {openSlots > 0 && (
              <div className="rounded-full border p-1 px-2 flex items-center gap-1 opacity-50">
                <PlusIcon className="size-3" />
                <span className="text-xs font-medium">{openSlots} open</span>
              </div>
            )}
          </div>
        </div>
      )}
      <Separator />
      <div className="flex items-center justify-between gap-2">
        <Button>
          <CircleCheckIcon />
          Check in {props.type !== "portal" && "riders"}
        </Button>
        {props.type !== "portal" ? (
          <Button
            variant="ghost"
            onClick={() =>
              viewLessonModalHandler.openWithPayload({ lesson: props.lesson })
            }
          >
            <EditIcon />
            Edit
          </Button>
        ) : (
          <Button variant="ghost">Unenroll</Button>
        )}
      </div>
    </div>
  );
}
