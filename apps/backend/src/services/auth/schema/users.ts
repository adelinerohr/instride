import * as p from "drizzle-orm/pg-core";

export const authUsers = p.pgTable(
  "auth_users",
  {
    id: p.text("id").primaryKey(),
    name: p.text("name").notNull(),
    email: p.text("email").notNull().unique(),
    emailVerified: p.boolean("email_verified").default(false).notNull(),
    image: p.text("image"),
    phone: p.text("phone"),
    profilePictureUrl: p.text("profile_picture_url"),
    role: p.text("role"),
    banned: p.boolean("banned").default(false),
    banReason: p.text("ban_reason"),
    banExpires: p.timestamp("ban_expires"),
    createdAt: p.timestamp("created_at").defaultNow().notNull(),
    updatedAt: p
      .timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [p.index("authUsers_email_idx").on(table.email)]
);
