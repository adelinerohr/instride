import * as p from "drizzle-orm/pg-core";

import { boards, members, organizations } from "@/database/schema";

import { KioskScope } from "../types/models";

export const kioskScopeEnum = p.pgEnum("kiosk_scope", KioskScope);

export const kioskSessions = p.pgTable(
  "kiosk_sessions",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Persistent configuration (set by admin, never changes)
    boardId: p
      .uuid("board_id")
      .references(() => boards.id, { onDelete: "set null" }),
    locationName: p.text("location_name").notNull(),

    // Temporary acting state (changes when someone verifies/logs out)
    actingMemberId: p
      .uuid("acting_for_member_id")
      .references(() => members.id, { onDelete: "set null" }),
    scope: kioskScopeEnum("scope").notNull().default(KioskScope.DEFAULT),

    // When the token expires
    expiresAt: p.timestamp("expires_at", { withTimezone: true }),
    createdAt: p
      .timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: p
      .timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    p.index("kioskActingTokens_organizationId_idx").on(table.organizationId),
    p.index("kioskActingTokens_expiresAt_idx").on(table.expiresAt),
    p.index("kioskActingTokens_actingMemberId_idx").on(table.actingMemberId),
  ]
);
