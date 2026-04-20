import { sql } from "drizzle-orm";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { db } from "./db";
import { notificationPreferences } from "./schema";
import { NotificationPreference, NotificationType } from "./types/models";

export const getPreferences = api(
  {
    method: "GET",
    path: "/notifications/:memberId/preferences",
    expose: true,
    auth: true,
  },
  async (input: { memberId: string }): Promise<NotificationPreference> => {
    const { organizationId } = requireOrganizationAuth();

    const preferences = await db.query.notificationPreferences.findFirst({
      where: { memberId: input.memberId, organizationId },
    });

    assertExists(preferences, "Preferences not found");

    return preferences;
  }
);

interface UpdatePreferencesParams {
  memberId: string;
  preferences: {
    type: NotificationType;
    inAppEnabled: boolean;
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
  }[];
}

export const updatePreferences = api(
  {
    method: "PUT",
    path: "/notifications/:memberId/preferences",
    expose: true,
    auth: true,
  },
  async (
    params: UpdatePreferencesParams
  ): Promise<{ preferences: NotificationPreference[] }> => {
    const { organizationId } = requireOrganizationAuth();

    const upserted = await db
      .insert(notificationPreferences)
      .values(
        params.preferences.map((preference) => ({
          ...preference,
          organizationId,
          memberId: params.memberId,
        }))
      )
      .onConflictDoUpdate({
        target: [
          notificationPreferences.memberId,
          notificationPreferences.organizationId,
          notificationPreferences.type,
        ],
        set: {
          inAppEnabled: sql`excluded.in_app_enabled`,
          pushEnabled: sql`excluded.push_enabled`,
          emailEnabled: sql`excluded.email_enabled`,
          smsEnabled: sql`excluded.sms_enabled`,
        },
      })
      .returning();

    return { preferences: upserted };
  }
);
