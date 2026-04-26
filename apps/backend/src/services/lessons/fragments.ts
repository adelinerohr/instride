import {
  riderExpansion,
  trainerExpansion,
} from "@/services/organizations/fragments";

import { boardExpansion, serviceExpansion } from "../boards/fragments";

// Series with the canonical expansion needed to satisfy LessonSeries contract.
export const lessonSeriesExpansion = {
  level: true,
  trainer: { with: trainerExpansion },
  board: { with: boardExpansion },
  service: { with: serviceExpansion },
  enrollments: {
    with: { rider: { with: riderExpansion } },
  },
} as const;

// Series summary — what gets nested under an instance. No enrollments.
export const lessonSeriesSummaryExpansion = {} as const;

// Instance with the canonical expansion needed to satisfy LessonInstance contract.
export const lessonInstanceExpansion = {
  level: true,
  trainer: { with: trainerExpansion },
  board: { with: boardExpansion },
  service: { with: serviceExpansion },
  series: true, // for LessonSeriesSummary
  enrollments: {
    with: { rider: { with: riderExpansion } },
  },
} as const;
