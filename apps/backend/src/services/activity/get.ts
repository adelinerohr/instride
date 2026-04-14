import { api } from "encore.dev/api";

import { db } from "@/database";
import { requireOrganizationAuth } from "@/shared/auth";

import { ListActivityResponse } from "./types/contracts";
import { Activity } from "./types/models";

interface ListActivityRequest {
  riderId?: string;
  trainerId?: string;
  ownerMemberId: string;
}

export const listActivity = api(
  {
    method: "GET",
    path: "/activity",
    expose: true,
    auth: true,
  },
  async (request: ListActivityRequest): Promise<ListActivityResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const activities: Activity[] = [];

    // Role neutral activities
    const roleNeutralActivities = await db.query.activity.findMany({
      where: {
        organizationId,
        ownerMemberId: request.ownerMemberId,
        trainerId: {
          isNull: true,
        },
        riderId: {
          isNull: true,
        },
      },
    });

    activities.push(...roleNeutralActivities);

    if (request.riderId) {
      const riderActivities = await db.query.activity.findMany({
        where: {
          organizationId,
          riderId: request.riderId,
        },
        orderBy: {
          createdAt: "desc",
        },
        with: {
          actorMember: {
            with: {
              authUser: true,
            },
          },
        },
      });

      activities.push(...riderActivities);
    }

    if (request.trainerId) {
      const trainerActivities = await db.query.activity.findMany({
        where: {
          organizationId,
          trainerId: request.trainerId,
        },
        orderBy: {
          createdAt: "desc",
        },
        with: {
          actorMember: {
            with: {
              authUser: true,
            },
          },
        },
      });

      activities.push(...trainerActivities);
    }

    // Order activities by createdAt descending
    activities.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return { activities };
  }
);
