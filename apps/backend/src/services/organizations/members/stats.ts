import { isAfter, isBefore, startOfMonth, subMonths } from "date-fns";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { levelService } from "../levels/level.service";
import { memberRepo } from "./member.repo";

interface GetRiderStatsResponse {
  totalRiders: number;
  newRidersThisMonth: number;
  newRidersLastMonth: number;
  percentageChange: number;
  ridersByLevel: {
    levelName: string;
    count: number;
    color: string;
  }[];
}

export const getRiderStats = api(
  {
    method: "GET",
    path: "/organizations/riders/stats",
    expose: true,
    auth: true,
  },
  async (): Promise<GetRiderStatsResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const riders = await memberRepo.findManyRiders(organizationId);
    const levels = await levelService.findMany(organizationId);

    const totalRiders = riders.length;
    const thisMonthStart = startOfMonth(new Date());
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));

    const newRidersThisMonth = riders.filter((r) =>
      isAfter(r.createdAt, thisMonthStart)
    ).length;

    const newRidersLastMonth = riders.filter(
      (r) =>
        isAfter(r.createdAt, lastMonthStart) &&
        isBefore(r.createdAt, thisMonthStart)
    ).length;

    const percentageChange =
      newRidersLastMonth > 0
        ? ((newRidersThisMonth - newRidersLastMonth) / newRidersLastMonth) * 100
        : newRidersThisMonth > 0
          ? 100
          : 0;

    const levelsById = new Map(levels.map((l) => [l.id, l]));
    const levelCounts = new Map<string, { count: number; color: string }>();

    for (const rider of riders) {
      if (!rider.ridingLevelId) continue;
      const level = levelsById.get(rider.ridingLevelId);
      if (!level) continue;
      const existing = levelCounts.get(level.name);
      if (existing) {
        existing.count++;
      } else {
        levelCounts.set(level.name, { count: 1, color: level.color });
      }
    }

    return {
      totalRiders,
      newRidersThisMonth,
      newRidersLastMonth,
      percentageChange,
      ridersByLevel: Array.from(levelCounts.entries()).map(
        ([levelName, data]) => ({
          levelName,
          count: data.count,
          color: data.color,
        })
      ),
    };
  }
);
