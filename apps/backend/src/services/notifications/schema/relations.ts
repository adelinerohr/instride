import { defineRelationsPart } from "drizzle-orm/relations";

import * as schema from "@/database/schema";

export const notificationsRelations = defineRelationsPart(schema, (r) => ({
  notifications: {
    organization: r.one.organizations({
      from: r.notifications.organizationId,
      to: r.organizations.id,
    }),
    recipient: r.one.members({
      from: r.notifications.recipientId,
      to: r.members.id,
    }),
    deliveries: r.many.notificationDeliveries({
      from: r.notifications.id,
      to: r.notificationDeliveries.notificationId,
    }),
  },
  notificationDeliveries: {
    notification: r.one.notifications({
      from: r.notificationDeliveries.notificationId,
      to: r.notifications.id,
    }),
  },
  notificationPreferences: {
    member: r.one.members({
      from: r.notificationPreferences.memberId,
      to: r.members.id,
    }),
    organization: r.one.organizations({
      from: r.notificationPreferences.organizationId,
      to: r.organizations.id,
    }),
  },
  notificationPushTokens: {
    member: r.one.members({
      from: r.notificationPushTokens.memberId,
      to: r.members.id,
    }),
    organization: r.one.organizations({
      from: r.notificationPushTokens.organizationId,
      to: r.organizations.id,
    }),
  },
}));
