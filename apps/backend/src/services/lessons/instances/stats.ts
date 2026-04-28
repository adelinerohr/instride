import type { GetLessonStatsResponse } from "@instride/api/contracts";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { lessonInstanceRepo } from "./instance.repo";

export const getLessonStats = api(
  {
    method: "GET",
    path: "/lessons/instances/stats",
    expose: true,
    auth: true,
  },
  async (): Promise<GetLessonStatsResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const [thisMonth, lastMonth] = await Promise.all([
      lessonInstanceRepo.findMany({
        organizationId,
        filters: { range: { from: thisMonthStart, to: thisMonthEnd } },
      }),
      lessonInstanceRepo.findMany({
        organizationId,
        filters: { range: { from: lastMonthStart, to: lastMonthEnd } },
      }),
    ]);

    const totalLessonInstancesThisMonth = thisMonth.length;
    const totalLessonInstancesLastMonth = lastMonth.length;

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
