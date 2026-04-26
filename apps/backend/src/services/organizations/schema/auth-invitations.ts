import { InvitationStatus, MembershipRole } from "@instride/shared";
import * as p from "drizzle-orm/pg-core";

import { invitationStatusEnum } from "@/services/guardians/schema";

import { authUsers } from "../../auth/schema/users";
import { authOrganizations } from "./auth-organizations";
import { membershipRoleEnum } from "./members";

export const authInvitations = p.pgTable(
  "auth_invitations",
  {
    id: p.text("id").primaryKey(),
    organizationId: p
      .text("organization_id")
      .notNull()
      .references(() => authOrganizations.id, { onDelete: "cascade" }),
    email: p.text("email").notNull(),
    roles: membershipRoleEnum("roles")
      .array()
      .notNull()
      .default([MembershipRole.RIDER]),
    status: invitationStatusEnum("status")
      .default(InvitationStatus.PENDING)
      .notNull(),
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
