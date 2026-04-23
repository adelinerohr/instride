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

export function LessonCardDetail({ data }: LessonCardVariantProps) {
  const {
    lesson,
    startTime,
    endTime,
    duration,
    lessonTitle,
    isPrivate,
    trainerUser,
    riderUser,
    openSlots,
    rosterStatus,
  } = data;

  const isLessonOngoing =
    isAfter(new Date(), lesson.start) && isBefore(new Date(), lesson.end);

  const showRiderPanel = riderUser != null;
  const showRosterPanel = !showRiderPanel;

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
          {startTime} &middot; {duration}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="font-display text-2xl">
          {isPrivate ? "Private" : "Group"} &mdash; {lessonTitle}
        </div>
        <div className="flex items-center gap-1">
          <LevelBadge level={lesson.level} />
          <Badge variant="secondary">
            {isPrivate ? <UserIcon /> : <UsersIcon />}
            {isPrivate ? "Private" : "Group"}
          </Badge>
        </div>
      </div>

      <TagGroup className="grid grid-cols-3 gap-2">
        <Tag icon={UserIcon}>{trainerUser.name}</Tag>
        <Tag icon={ClockIcon}>
          {startTime} - {endTime}
        </Tag>
        <Tag icon={MapPinIcon}>{lesson.board?.name}</Tag>
      </TagGroup>

      {showRiderPanel && (
        <div className="flex items-center gap-2 w-full border rounded-md p-2">
          <UserAvatar user={riderUser} />
          <div className="flex flex-col">
            <span className="font-medium text-lg">{riderUser.name}</span>
            <span className="text-sm text-muted-foreground">
              {riderUser.email}
            </span>
          </div>
        </div>
      )}

      {showRosterPanel && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 justify-between">
            <span className="text-xs text-primary font-medium">
              Roster &middot; {lesson.enrollments?.length ?? 0}/
              {lesson.maxRiders}
            </span>
            <span className="text-muted-foreground font-medium text-xs">
              {rosterStatus.checkedIn.length} of {lesson.maxRiders} checked in
            </span>
          </div>
          <div className="flex gap-2">
            {rosterStatus.checkedIn.map((user) => (
              <div
                key={user.id}
                className="rounded-full border p-1 pr-2 flex items-center gap-2"
              >
                <UserAvatar user={user} size="xs" />
                <span className="text-xs font-medium">{user.name}</span>
                <CheckIcon className="size-3 text-muted-foreground" />
              </div>
            ))}
            {rosterStatus.notCheckedIn.map((user) => (
              <div
                key={user.id}
                className="rounded-full border p-1 pr-2 flex items-center gap-2"
              >
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
          Check in{!showRiderPanel && " riders"}
        </Button>
        {showRiderPanel ? (
          <Button variant="ghost">Unenroll</Button>
        ) : (
          <Button
            variant="ghost"
            onClick={() => viewLessonModalHandler.openWithPayload({ lesson })}
          >
            <EditIcon />
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}
