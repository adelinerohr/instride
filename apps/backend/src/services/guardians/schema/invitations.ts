import { InvitationStatus } from "@instride/shared";
import * as p from "drizzle-orm/pg-core";

import { guardianRelationships } from "./relationships";

export const invitationStatusEnum = p.pgEnum(
  "invitation_status",
  InvitationStatus
);

/**
 * GUARDIAN INVITATIONS
 * Invitations to join a guardian relationship
 */
export const guardianInvitations = p.pgTable(
  "guardian_invitations",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    relationshipId: p
      .uuid("relationship_id")
      .notNull()
      .references(() => guardianRelationships.id, { onDelete: "cascade" }),

    /** unique identifier for the invitation URL */
    token: p.text("token").notNull().unique(),

    /** email address for the invited dependent */
    email: p.text("email").notNull(),

    status: invitationStatusEnum("status").notNull().default("pending"),
    lastSentAt: p.timestamp("last_sent_at", { withTimezone: true }),

    createdAt: p.timestamp("created_at").notNull().defaultNow(),
    expiresAt: p.timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: p.timestamp("accepted_at", { withTimezone: true }),
    updatedAt: p
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    p.index("guardian_inv_relationship_idx").on(table.relationshipId),
    p.index("guardian_inv_token_idx").on(table.token),
    p.index("guardian_inv_email_status_idx").on(table.email, table.status),
  ]
);

export type GuardianInvitation = typeof guardianInvitations.$inferSelect;
export type NewGuardianInvitation = typeof guardianInvitations.$inferInsert;
