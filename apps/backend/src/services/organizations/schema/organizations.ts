import * as p from "drizzle-orm/pg-core";

import { authOrganizations } from "./auth-organizations";

// -------------------------------------------------------
// Organizations
// Extension of Better Auth's organizations table
// -------------------------------------------------------
export const organizations = p.pgTable(
  "organizations",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    authOrganizationId: p
      .text("auth_organization_id")
      .notNull()
      .references(() => authOrganizations.id),
    name: p.text("name").notNull(),
    slug: p.text("slug").notNull().unique(),
    timezone: p.text("timezone").notNull().default("UTC"),

    // Branding
    logoUrl: p.text("logo_url"),
    primaryColor: p.text("primary_color"),

    // Contact Information
    phone: p.text("phone"),
    website: p.text("website"),

    // social
    facebook: p.text("facebook"),
    instagram: p.text("instagram"),
    youtube: p.text("youtube"),
    tiktok: p.text("tiktok"),

    // address
    addressLine1: p.text("address_line_1"),
    addressLine2: p.text("address_line_2"),
    city: p.text("city"),
    state: p.text("state"),
    postalCode: p.text("postal_code"),

    // settings
    allowSameDayBookings: p
      .boolean("allow_same_day_bookings")
      .notNull()
      .default(false),
    allowPublicJoin: p.boolean("allow_public_join").notNull().default(false),

    createdAt: p.timestamp("created_at").notNull().defaultNow(),
    updatedAt: p
      .timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    p.index("organizations_slug_idx").on(table.slug),
    p
      .index("organizations_authOrganizationId_idx")
      .on(table.authOrganizationId),
  ]
);

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
