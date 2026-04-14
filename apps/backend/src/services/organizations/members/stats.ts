import { isAfter, isBefore, startOfMonth, subMonths } from "date-fns";
import { api } from "encore.dev/api";

import { listLevels } from "../levels/get";
import { listRiders } from "./get";

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
    const { riders } = await listRiders();
    const totalRiders = riders.length;

    // Calculate new riders this month
    const thisMonthStart = startOfMonth(new Date());
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));

    const newRidersThisMonth = riders.filter((rider) =>
      isAfter(rider.createdAt, thisMonthStart)
    ).length;
    const newRidersLastMonth = riders.filter(
      (rider) =>
        isAfter(rider.createdAt, lastMonthStart) &&
        isBefore(rider.createdAt, thisMonthStart)
    ).length;

    // Calculate percentage change
    const percentageChange =
      newRidersLastMonth > 0
        ? ((newRidersThisMonth - newRidersLastMonth) / newRidersLastMonth) * 100
        : newRidersThisMonth > 0
          ? 100
          : 0;

    // Get riders by level
    const levelIds = riders
      .map((rider) => rider.ridingLevelId)
      .filter((id) => id !== null);

    const { levels } = await listLevels();
    const filteredLevels = levels.filter((level) =>
      levelIds.includes(level.id)
    );

    const levelCounts: Record<string, { count: number; color: string }> = {};

    riders.forEach((rider) => {
      if (rider.ridingLevelId) {
        const level = filteredLevels.find(
          (level) => level.id === rider.ridingLevelId
        );
        if (level) {
          if (!levelCounts[level.name]) {
            levelCounts[level.name] = { count: 0, color: level.color };
          }
          levelCounts[level.name].count++;
        }
      }
    });

    const ridersByLevel = Object.entries(levelCounts).map(
      ([levelName, data]) => ({
        levelName,
        count: data.count,
        color: data.color,
      })
    );

    return {
      totalRiders,
      newRidersThisMonth,
      newRidersLastMonth,
      percentageChange,
      ridersByLevel,
    };
  }
);
