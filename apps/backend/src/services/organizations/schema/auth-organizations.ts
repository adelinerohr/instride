import * as p from "drizzle-orm/pg-core";

export const authOrganizations = p.pgTable("auth_organizations", {
  id: p.text("id").primaryKey(),
  name: p.text("name").notNull(),
  slug: p.text("slug").notNull().unique(),
  logo: p.text("logo"),
  timezone: p.text("timezone").notNull().default("UTC"),
  createdAt: p.timestamp("created_at").notNull().defaultNow(),
  metadata: p.text("metadata"),
});
