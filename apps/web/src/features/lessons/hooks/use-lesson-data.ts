import { getUser, type types } from "@instride/api";
import { differenceInMinutes, format, formatDuration } from "date-fns";

export interface LessonRosterStatus {
  checkedIn: types.AuthUser[];
  notCheckedIn: types.AuthUser[];
}

export interface LessonCardData {
  lesson: types.LessonInstance;
  startTime: string;
  endTime: string;
  duration: string;
  lessonTitle: string;
  isPrivate: boolean;
  trainerUser: types.AuthUser;
  riderUser: types.AuthUser | null;
  openSlots: number;
  rosterStatus: LessonRosterStatus;
}

export function useLessonCardData(params: {
  lesson: types.LessonInstance;
  rider?: types.Rider | null;
}): LessonCardData {
  const { lesson, rider } = params;

  if (!lesson.trainer) {
    throw Error("Lesson must have a trainer");
  }

  const checkedIn: types.AuthUser[] = [];
  const notCheckedIn: types.AuthUser[] = [];

  for (const enrollment of lesson.enrollments ?? []) {
    if (!enrollment.rider) continue;
    const user = getUser({ rider: enrollment.rider });
    if (enrollment.attended) {
      checkedIn.push(user);
    } else {
      notCheckedIn.push(user);
    }
  }

  return {
    lesson,
    startTime: format(lesson.start, "hh:mm a"),
    endTime: format(lesson.end, "hh:mm a"),
    duration: formatDuration({
      minutes: differenceInMinutes(lesson.end, lesson.start),
    }),
    lessonTitle:
      lesson.name?.trim() || lesson.service?.name?.trim() || "Lesson",
    isPrivate: lesson.maxRiders === 1,
    trainerUser: getUser({ trainer: lesson.trainer }),
    riderUser: rider ? getUser({ rider }) : null,
    openSlots: lesson.maxRiders - (lesson.enrollments?.length ?? 0),
    rosterStatus: { checkedIn, notCheckedIn },
  };
}
