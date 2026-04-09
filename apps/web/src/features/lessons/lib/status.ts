import { LessonSeriesStatus } from "@instride/shared";

export const STATUS_VARIANTS: Record<
  LessonSeriesStatus,
  | "link"
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | null
  | undefined
> = {
  [LessonSeriesStatus.ACTIVE]: "default",
  [LessonSeriesStatus.PAUSED]: "secondary",
  [LessonSeriesStatus.CANCELLED]: "destructive",
  [LessonSeriesStatus.COMPLETED]: "outline",
};
