import type {
  ListPreferencesResponse,
  UpdatePreferencesRequest,
  UpdatePreferencesResponse,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { toNotificationPreference } from "./mappers";
import { notificationRepo } from "./notification.repo";

/**
 * Returns ALL preferences for a member (one row per notification type),
 * not just one. The original "find first" only returned one preference,
 * which made it impossible for the UI to show a full preferences list.
 */
export const getPreferences = api(
  {
    method: "GET",
    path: "/notifications/:memberId/preferences",
    expose: true,
    auth: true,
  },
  async ({
    memberId,
  }: {
    memberId: string;
  }): Promise<ListPreferencesResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const rows = await notificationRepo.findPreferencesForMember({
      memberId,
      organizationId,
    });

    return { preferences: rows.map(toNotificationPreference) };
  }
);

export const updatePreferences = api(
  {
    method: "PUT",
    path: "/notifications/:memberId/preferences",
    expose: true,
    auth: true,
  },
  async (
    request: UpdatePreferencesRequest
  ): Promise<UpdatePreferencesResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const upserted = await notificationRepo.upsertPreferences(
      request.preferences.map((preference) => ({
        ...preference,
        organizationId,
        memberId: request.memberId,
      }))
    );

    return { preferences: upserted.map(toNotificationPreference) };
  }
);
