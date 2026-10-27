import * as p from "drizzle-orm/pg-core";

export const timestamps = {
  createdAt: p.timestamp("created_at").notNull().defaultNow(),
  updatedAt: p
    .timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
