import { api, APIError } from "encore.dev/api";

import { db } from "@/database";

import { GetPreferencesResponse } from "./types/contracts";
import { Notification } from "./types/models";

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
  }): Promise<GetPreferencesResponse> => {
    const preferences = await db.query.notificationPreferences.findFirst({
      where: { memberId },
    });

    if (!preferences) {
      throw APIError.notFound("Preferences not found");
    }

    return { preferences };
  }
);

interface GetUnreadResponse {
  notifications: Notification[];
  unreadCount: number;
}

export const getUnread = api(
  {
    method: "GET",
    path: "/notifications/:memberId/unread-count",
    expose: true,
    auth: true,
  },
  async ({ memberId }: { memberId: string }): Promise<GetUnreadResponse> => {
    const unread = await db.query.notifications.findMany({
      where: {
        recipientId: memberId,
        isRead: false,
      },
    });

    return { notifications: unread, unreadCount: unread.length };
  }
);
