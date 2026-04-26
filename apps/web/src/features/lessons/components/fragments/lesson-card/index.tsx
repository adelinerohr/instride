import type { LessonInstance, Rider } from "@instride/api";

import {
  useLessonCardData,
  type LessonCardData,
} from "@/features/lessons/hooks/use-lesson-data";

import { LessonCardAgenda } from "./agenda";
import { LessonCardDateChip } from "./date-chip";
import { LessonCardDetail } from "./detail";

export enum LessonCardVariant {
  DETAIL = "detail",
  DATE_CHIP = "date-chip",
  AGENDA = "agenda",
}

interface LessonCardProps {
  variant: LessonCardVariant;
  lesson: LessonInstance;
  rider?: Rider;
}

export interface LessonCardVariantProps {
  data: LessonCardData;
}

export function LessonCard({ variant, lesson, rider }: LessonCardProps) {
  const data = useLessonCardData({ lesson, rider });
  const variantProps: LessonCardVariantProps = { data };

  switch (variant) {
    case LessonCardVariant.DETAIL:
      return <LessonCardDetail {...variantProps} />;
    case LessonCardVariant.DATE_CHIP:
      return <LessonCardDateChip {...variantProps} />;
    case LessonCardVariant.AGENDA:
      return <LessonCardAgenda {...variantProps} />;
  }
}
