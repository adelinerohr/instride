import { GuardianRelationshipStatus } from "@instride/shared";
import { api } from "encore.dev/api";

import { requireAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { db } from "./db";

export const canAccessOrganization = api(
  {
    method: "GET",
    path: "/organizations/:organizationId/can-access",
    expose: true,
    auth: true,
  },
  async (params: {
    organizationId: string;
  }): Promise<{ canAccess: boolean; reason?: string }> => {
    const { userID } = requireAuth();

    const member = await db.query.members.findFirst({
      where: {
        userId: userID,
        organizationId: params.organizationId,
      },
      with: {
        rider: true,
      },
    });

    assertExists(member, "Member not found");
    assertExists(member.rider, "Rider not found");

    if (member.isPlaceholder) {
      return {
        canAccess: false,
        reason: "Please accept your guardian invitation first",
      };
    }

    if (member.rider.isRestricted) {
      const relationship = await db.query.guardianRelationships.findFirst({
        where: {
          dependentMemberId: member.id,
          status: GuardianRelationshipStatus.ACTIVE,
        },
      });

      if (!relationship) {
        return {
          canAccess: false,
          reason: "No active guardian relationship found",
        };
      }
    }

    return {
      canAccess: true,
    };
  }
);
