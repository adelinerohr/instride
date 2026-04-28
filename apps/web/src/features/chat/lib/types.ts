import type {
  Board,
  LessonInstance,
  LessonProposalPayload,
  Service,
  Trainer,
  Level,
} from "@instride/api";

/**
 * Normalized shape that the card actually renders. Both real lesson
 * instances and unrealized proposals project into this.
 */
export interface LessonView {
  title: string;
  level: Level | null;
  trainer: Trainer;
  board: Board;
  service: Service;
  start: Date;
  end: Date;
  /** Real lessons have capacity info; proposals don't. */
  spots: { open: number; total: number } | null;
}

export function normalizeLesson(lesson: LessonInstance): LessonView {
  return {
    title:
      lesson.name && lesson.name.trim().length > 0
        ? lesson.name
        : lesson.service.name,
    level: lesson.level ?? null,
    trainer: lesson.trainer,
    board: lesson.board,
    service: lesson.service,
    start: new Date(lesson.start),
    end: new Date(lesson.end),
    spots: {
      open: lesson.maxRiders - lesson.enrollments.length,
      total: lesson.maxRiders,
    },
  };
}

export function normalizeProposal(input: {
  proposal: LessonProposalPayload;
  trainer: Trainer;
  board: Board;
  service: Service;
}): LessonView {
  const start = new Date(input.proposal.start);
  return {
    title: input.service.name,
    level: input.service.restrictedToLevel ?? null,
    trainer: input.trainer,
    board: input.board,
    service: input.service,
    start,
    end: new Date(start.getTime() + input.service.duration * 60 * 1000),
    spots: null, // proposals have no capacity until materialized
  };
}
