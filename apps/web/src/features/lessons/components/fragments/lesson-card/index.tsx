import type { types } from "@instride/api";
import { getUser } from "@instride/api";
import { differenceInMinutes, format, formatDuration } from "date-fns";

import { DateChipLessonCard } from "./date-chip";
import { LessonCardDetail } from "./detail";

interface LessonCardProps {
  variant: "detail" | "date-chip";
  lessonEnrollment: types.LessonInstanceEnrollment;
}

export interface LessonCardVariantProps {
  startTime: string;
  endTime: string;
  duration: string;
  lesson: types.LessonInstance;
  lessonTitle: string;
  isPrivate: boolean;
  trainerUser: types.AuthUser;
  riderUser: types.AuthUser;
}

export function LessonCard({ variant, lessonEnrollment }: LessonCardProps) {
  const lesson = lessonEnrollment.instance;
  const rider = lessonEnrollment.rider;
  const trainer = lesson?.trainer;

  console.log(lessonEnrollment);

  if (!lesson || !trainer || !rider) return null;

  const startTime = format(lesson.start, "hh:mm a");
  const endTime = format(lesson.end, "hh:mm a");
  const duration = formatDuration({
    minutes: differenceInMinutes(lesson.end, lesson.start),
  });

  const lessonTitle = lesson.name ?? lesson.service?.name ?? "Lesson";
  const isPrivate = lesson.maxRiders === 1;

  const trainerUser = getUser({ trainer });
  const riderUser = getUser({ rider });

  const props = {
    startTime,
    endTime,
    duration,
    lessonTitle,
    isPrivate,
    trainerUser,
    riderUser,
  };

  if (variant === "detail") {
    return <LessonCardDetail lesson={lesson} {...props} />;
  } else if (variant === "date-chip") {
    return <DateChipLessonCard lesson={lesson} {...props} />;
  }
}
