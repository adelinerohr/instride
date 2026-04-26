import * as p from "drizzle-orm/pg-core";

import { authUsers } from "../../auth/schema/users";
import { authOrganizations } from "./auth-organizations";

export const authInvitations = p.pgTable(
  "auth_invitations",
  {
    id: p.text("id").primaryKey(),
    organizationId: p
      .text("organization_id")
      .notNull()
      .references(() => authOrganizations.id, { onDelete: "cascade" }),
    email: p.text("email").notNull(),
    role: p.text("role"),
    status: p.text("status").default("pending").notNull(),
    expiresAt: p.timestamp("expires_at").notNull(),
    createdAt: p.timestamp("created_at").defaultNow().notNull(),
    inviterId: p
      .text("inviter_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
  },
  (table) => [
    p.index("authInvitations_organizationId_idx").on(table.organizationId),
    p.index("authInvitations_email_idx").on(table.email),
  ]
);

export type AuthInvitationRow = typeof authInvitations.$inferSelect;
export type NewAuthInvitationRow = typeof authInvitations.$inferInsert;
