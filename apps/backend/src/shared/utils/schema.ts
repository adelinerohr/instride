import * as p from "drizzle-orm/pg-core";

import { db } from "@/database";

export const timeStamps = {
  createdAt: p.timestamp("created_at").defaultNow().notNull(),
  updatedAt: p
    .timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
};

export type Database = typeof db;
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
