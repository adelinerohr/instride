import * as p from "drizzle-orm/pg-core";

import { authUsers } from "./users";

export const authSessions = p.pgTable(
  "auth_sessions",
  {
    id: p.text("id").primaryKey(),
    expiresAt: p.timestamp("expires_at").notNull(),
    token: p.text("token").notNull().unique(),
    createdAt: p.timestamp("created_at").defaultNow().notNull(),
    updatedAt: p
      .timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: p.text("ip_address"),
    userAgent: p.text("user_agent"),
    userId: p
      .text("user_id")
      .references(() => authUsers.id, { onDelete: "cascade" }),
    impersonatedBy: p.text("impersonated_by"),
    activeOrganizationId: p.text("active_organization_id"),
    contextOrganizationId: p.text("context_organization_id"),
  },
  (table) => [p.index("authSessions_userId_idx").on(table.userId)]
);
