import { LessonInstance } from "#contracts";

export function getLessonName(lesson: LessonInstance) {
  if (lesson.name && lesson.name.trim().length > 0) {
    return lesson.name;
  }

  return lesson.service.name;
}

export function isPrivateLesson(lesson: LessonInstance) {
  return lesson.maxRiders === 1;
}
