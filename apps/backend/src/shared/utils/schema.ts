import * as p from "drizzle-orm/pg-core";

export const timeStamps = {
  createdAt: p.timestamp("created_at").defaultNow().notNull(),
  updatedAt: p
    .timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
};
