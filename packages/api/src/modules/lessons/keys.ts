/**
 * Key Hierarchy:
 *   ["lessons"]                                      ← nuke everything
 *   ["lessons", "series"]                            ← all series
 *   ["lessons", "series", seriesId]                  ← one series
 *   ["lessons", "series", seriesId, "riders"]        ← series riders
 *   ["lessons", "instances"]                         ← all instances
 *   ["lessons", "instances", instanceId]             ← one instance
 *   ["lessons", "enrollments"]                       ← all enrollments
 *   ["lessons", "enrollments", "my"]                 ← current user's enrollments
 */

const getLessonRootKey = ["lessons"] as const;

export const lessonKeys = {
  list: () => getLessonRootKey,

  // Lesson Series
  series: () => [...getLessonRootKey, "series"] as const,
  seriesById: (seriesId: string) => [...lessonKeys.series(), seriesId] as const,
  seriesRides: (seriesId: string) =>
    [...lessonKeys.series(), seriesId, "riders"] as const,

  // Instances — scoped by date range since that's always how the calendar fetches
  instances: () => [...getLessonRootKey, "instances"] as const,
  instanceLists: () => [...getLessonRootKey, "instances", "list"] as const,
  instancesInRange: (from: string, to: string) =>
    [...getLessonRootKey, "instances", "list", "range", { from, to }] as const,
  instanceById: (id: string) =>
    [...getLessonRootKey, "instances", "detail", id] as const,
  stats: () => [...getLessonRootKey, "instances", "stats"] as const,

  // Enrollments
  enrollments: () => [...getLessonRootKey, "enrollments"] as const,
  seriesEnrollments: (seriesId: string) =>
    [...lessonKeys.enrollments(), "series", seriesId] as const,
  instanceEnrollments: (instanceId: string) =>
    [...lessonKeys.enrollments(), "instances", instanceId] as const,
  myEnrollments: () => [...lessonKeys.enrollments(), "my"] as const,
};
