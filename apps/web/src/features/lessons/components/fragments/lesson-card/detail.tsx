import {
  ArrowRightIcon,
  CircleCheckIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";

import type { LessonCardVariantProps } from ".";

export function LessonCardDetail({ lesson, ...props }: LessonCardVariantProps) {
  return (
    <div className="flex flex-col p-4 gap-2 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <Badge>
          <ArrowRightIcon />
          Up next
        </Badge>
        <span className="text-sm">
          {props.startTime} &middot; {`${props.duration} min`}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <div className="font-display text-2xl">
          {props.isPrivate ? "Private" : "Group"} &emdash; {props.lessonTitle}
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline">
            {lesson.level?.name ?? "Unrestricted"}
          </Badge>
          <Badge variant="secondary">
            {props.isPrivate ? <UserIcon /> : <UsersIcon />}
            {props.isPrivate ? "Private" : "Group"}
          </Badge>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center gap-1">
          <UserIcon />
          {props.trainerUser.name}
        </div>
        <div className="flex items-center gap-1">
          <ClockIcon />
          {props.startTime} - {props.endTime}
        </div>
        <div className="flex items-center gap-1">
          <MapPinIcon />
          {lesson.board?.name}
        </div>
      </div>
      <div className="flex items-center gap-2 w-full border rounded-md p-2">
        <UserAvatar user={props.riderUser} />
        <div className="flex flex-col">
          <span className="font-medium text-lg">{props.riderUser.name}</span>
          <span className="text-sm text-muted-foreground">
            {props.riderUser.email}
          </span>
        </div>
      </div>
      <Separator />
      <div className="flex items-center justify-between gap-2">
        <Button>
          <CircleCheckIcon />
          Check in
        </Button>
        <Button variant="ghost">Unenroll</Button>
      </div>
    </div>
  );
}
