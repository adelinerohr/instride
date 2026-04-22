import type { types } from "@instride/api";
import { getUser } from "@instride/api";
import { differenceInMinutes, format, formatDuration } from "date-fns";

import { DateChipLessonCard } from "./date-chip";
import { LessonCardDetail } from "./detail";

type LessonCardVariant = "detail" | "date-chip";

interface AdminLessonCardProps {
  variant: LessonCardVariant;
  type: "admin" | "trainer";
  lesson: types.LessonInstance;
  showDate?: boolean;
}

interface PortalLessonCardProps {
  variant: LessonCardVariant;
  type: "portal";
  lessonEnrollment: types.LessonInstanceEnrollment;
  showDate?: boolean;
}

type LessonCardProps = AdminLessonCardProps | PortalLessonCardProps;

export interface BaseLessonCardVariantProps {
  startTime: string;
  endTime: string;
  duration: string;
  lesson: types.LessonInstance;
  lessonTitle: string;
  isPrivate: boolean;
  trainerUser: types.AuthUser;
  showDate?: boolean;
}

interface AdminLessonCardVariantProps extends BaseLessonCardVariantProps {
  type: "admin" | "trainer";
}

interface PortalLessonCardVariantProps extends BaseLessonCardVariantProps {
  type: "portal";
  riderUser: types.AuthUser;
}

export type LessonCardVariantProps =
  | AdminLessonCardVariantProps
  | PortalLessonCardVariantProps;

export function LessonCard(props: LessonCardProps) {
  const lesson =
    props.type === "portal" ? props.lessonEnrollment.instance : props.lesson;

  console.log(lesson);
  const rider =
    props.type === "portal" ? props.lessonEnrollment.rider : undefined;
  const trainer =
    props.type === "portal"
      ? props.lessonEnrollment.instance?.trainer
      : props.lesson.trainer;

  if (!lesson || !trainer) return null;

  if (props.type === "portal" && !rider) return null;

  const startTime = format(lesson.start, "hh:mm a");
  const endTime = format(lesson.end, "hh:mm a");
  const duration = formatDuration({
    minutes: differenceInMinutes(lesson.end, lesson.start),
  });

  const sharedFields = {
    variant: props.variant,
    lesson,
    startTime,
    endTime,
    duration,
    lessonTitle:
      lesson.name && lesson.name.trim().length > 0
        ? lesson.name
        : lesson.service?.name && lesson.service?.name.trim().length > 0
          ? lesson.service.name
          : "Lesson",
    isPrivate: lesson.maxRiders === 1,
    trainerUser: getUser({ trainer }),
    showDate: props.showDate,
  };

  if (props.variant === "detail") {
    if (props.type === "portal") {
      return (
        <LessonCardDetail
          {...sharedFields}
          type="portal"
          riderUser={getUser({ rider: rider! })}
        />
      );
    }
    return <LessonCardDetail {...sharedFields} type={props.type} />;
  }

  if (props.type === "portal") {
    return (
      <DateChipLessonCard
        {...sharedFields}
        type="portal"
        riderUser={getUser({ rider: rider! })}
      />
    );
  }
  return <DateChipLessonCard {...sharedFields} type={props.type} />;
}
