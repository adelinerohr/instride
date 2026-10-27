const root = ["lessons"] as const;

export const lessonKeys = {
  all: () => root,

  // Series
  series: () => [...root, "series"] as const,
  seriesById: (seriesId: string) => [...lessonKeys.series(), seriesId] as const,
  seriesRiders: (seriesId: string) =>
    [...lessonKeys.series(), seriesId, "riders"] as const,

  // Instances (list + detail share this prefix; invalidate here to cascade)
  instances: () => [...root, "instances"] as const,
  instanceLists: () => [...lessonKeys.instances(), "list"] as const,
  instancesInRange: (from: string, to: string) =>
    [...lessonKeys.instanceLists(), "range", { from, to }] as const,
  instanceById: (id: string) =>
    [...lessonKeys.instances(), "detail", id] as const,
  instancesByTrainer: (trainerId: string) =>
    [...lessonKeys.instances(), "trainer", trainerId] as const,

  // Stats — sibling of instances so enrollment invalidation doesn't refetch it
  // (move under instances if stats should refetch on enrollment changes)
  instanceStats: () => [...root, "stats"] as const,

  // Enrollments
  enrollments: () => [...root, "enrollments"] as const,
  seriesEnrollments: (seriesId: string) =>
    [...lessonKeys.enrollments(), "series", seriesId] as const,
  instanceEnrollments: (instanceId: string) =>
    [...lessonKeys.enrollments(), "instances", instanceId] as const,
  myEnrollments: () => [...lessonKeys.enrollments(), "my"] as const,
  myEnrollmentsInRange: (from: string, to: string) =>
    [...lessonKeys.myEnrollments(), "range", { from, to }] as const,
  byRiderId: (riderId: string) =>
    [...lessonKeys.enrollments(), "rider", riderId] as const,
};
