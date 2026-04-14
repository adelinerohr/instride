import { startOfMonth } from "date-fns";
import { subMonths } from "date-fns";
import { api } from "encore.dev/api";

import { listLessonInstances } from "./get";

interface GetLessonStatsResponse {
  totalLessonInstancesThisMonth: number;
  totalLessonInstancesLastMonth: number;
  percentageChange: number;
}

export const getLessonStats = api(
  {
    method: "GET",
    path: "/lessons/instances/stats",
    expose: true,
    auth: true,
  },
  async (): Promise<GetLessonStatsResponse> => {
    const thisMonthStart = startOfMonth(new Date());
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));

    const lessonInstancesThisMonth = await listLessonInstances({
      from: thisMonthStart.toISOString(),
      to: thisMonthStart.toISOString(),
    });

    const lessonInstancesLastMonth = await listLessonInstances({
      from: lastMonthStart.toISOString(),
      to: lastMonthStart.toISOString(),
    });

    const totalLessonInstancesThisMonth =
      lessonInstancesThisMonth.instances.length;
    const totalLessonInstancesLastMonth =
      lessonInstancesLastMonth.instances.length;

    const percentageChange =
      totalLessonInstancesLastMonth > 0
        ? ((totalLessonInstancesThisMonth - totalLessonInstancesLastMonth) /
            totalLessonInstancesLastMonth) *
          100
        : totalLessonInstancesThisMonth > 0
          ? 100
          : 0;

    return {
      totalLessonInstancesThisMonth,
      totalLessonInstancesLastMonth,
      percentageChange,
    };
  }
);
