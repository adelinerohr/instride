import { getUser, useLessonInstance } from "@instride/api";
import { useRouteContext } from "@tanstack/react-router";
import { formatInTimeZone } from "date-fns-tz";
import { RepeatIcon } from "lucide-react";
import type React from "react";

import { LevelBadge } from "@/features/organization/components/levels/level-badge";
import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Progress, ProgressLabel } from "@/shared/components/ui/progress";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";

import {
  AdminEnrolledRiderAction,
  KioskEnrolledRiderAction,
} from "./enrollments";
import { ViewLessonFooter } from "./footer";
import { KioskViewLessonFooter } from "./kiosk-footer";
import type { ViewLessonSheetPayload } from "./sheet";

export function ViewLessonContent({
  instanceId,
  isKiosk = false,
}: ViewLessonSheetPayload) {
  const { data: lesson } = useLessonInstance(instanceId);
  const { organization, isPortal } = useRouteContext({
    from: "/org/$slug/(authenticated)",
  });

  if (!lesson) return null;

  const trainerUser = getUser({ trainer: lesson.trainer });

  const openSpots = lesson.maxRiders - lesson.enrollments.length;
  const lessonName = lesson.name
    ? `${lesson.name} - ${lesson.service?.name}`
    : (lesson.service?.name ?? "Lesson Details");

  const getLessonDateTime = () => {
    const date = formatInTimeZone(
      new Date(lesson.start),
      organization.timezone,
      "EEEE, MMMM d, yyyy"
    );
    const startTime = formatInTimeZone(
      new Date(lesson.start),
      organization.timezone,
      "h:mm"
    );
    const endTime = formatInTimeZone(
      new Date(lesson.end),
      organization.timezone,
      "h:mm a"
    );
    return `${date} · ${startTime} - ${endTime}`;
  };

  const showUnenrollButton = !isPortal || isKiosk;

  return (
    <SheetContent className="sm:max-w-lg! border-l-0!">
      <SheetHeader className="bg-category-amber-bg border-l-6 border-category-amber-border border-b">
        <div className="flex gap-4 items-center">
          <LevelBadge level={lesson.level} />
          {lesson.series.isRecurring && (
            <Badge variant="outline">
              <RepeatIcon />
              Recurring
            </Badge>
          )}
        </div>
        <SheetTitle className="font-semibold font-display text-xl">
          {lessonName}
        </SheetTitle>
        <SheetDescription className="text-xs text-category-amber-fg">
          {getLessonDateTime()}
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-6 px-6 py-2">
        <div className="grid grid-cols-2 gap-6">
          <SheetItem label="Trainer">
            <div className="flex items-center gap-2">
              <UserAvatar user={trainerUser} />
              <span className="font-medium">{trainerUser.name}</span>
            </div>
          </SheetItem>
          <SheetItem label="Board">
            <span className="font-medium">{lesson.board.name}</span>
          </SheetItem>
          <SheetItem label="Service">
            <div className="flex flex-col gap-1">
              <span className="font-medium">{lesson.service.name}</span>
              <span className="text-xs text-muted-foreground">
                {lesson.service.duration} minutes
              </span>
            </div>
          </SheetItem>
          <SheetItem label="Capacity">
            <Progress
              value={
                (lesson.enrollments.length / lesson.service.maxRiders) * 100
              }
              color="amber"
            >
              <ProgressLabel>
                {lesson.enrollments.length} of {lesson.service.maxRiders} riders
              </ProgressLabel>
            </Progress>
          </SheetItem>
        </div>
        <SheetItem label="Riders enrolled">
          <div className="flex flex-col rounded-lg border divide-y">
            {lesson.enrollments.map((enrollment) => {
              const riderUser = getUser({ rider: enrollment.rider });
              return (
                <div
                  className="flex items-center p-4 gap-3"
                  key={enrollment.id}
                >
                  <UserAvatar user={riderUser} />
                  <span className="font-medium">{riderUser.name}</span>
                  {showUnenrollButton && (
                    <div className="ml-auto">
                      {isKiosk && (
                        <KioskEnrolledRiderAction
                          enrollment={enrollment}
                          lesson={lesson}
                        />
                      )}
                      {!isKiosk && (
                        <AdminEnrolledRiderAction
                          enrollment={enrollment}
                          lesson={lesson}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {Array.from({ length: openSpots }).map((_, index) => (
              <div
                className="flex items-center p-4 gap-3 opacity-50"
                key={index}
              >
                <div className="size-8 rounded-full border border-dashed border-primary/30" />
                <span className="italic">Open spot</span>
              </div>
            ))}
          </div>
        </SheetItem>
        <SheetItem label="Notes">
          <div className="bg-muted p-3 rounded-lg">
            {lesson.notes && lesson.notes.trim().length > 0
              ? lesson.notes
              : "No notes set"}
          </div>
        </SheetItem>
      </div>
      {isKiosk ? (
        <KioskViewLessonFooter lesson={lesson} />
      ) : (
        <ViewLessonFooter lesson={lesson} lessonName={lessonName} />
      )}
    </SheetContent>
  );
}

function SheetItem({
  label,
  children,
  ...props
}: React.ComponentProps<"div"> & { label: string }) {
  return (
    <div className="flex flex-col gap-3" {...props}>
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}
