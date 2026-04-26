import * as p from "drizzle-orm/pg-core";

import type { initDrizzle } from "@/database";

export const timeStamps = {
  createdAt: p.timestamp("created_at").defaultNow().notNull(),
  updatedAt: p
    .timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
};

export type Database = ReturnType<typeof initDrizzle>;
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

export function isTransaction(
  client: Database | Transaction
): client is Transaction {
  return (
    !("transaction" in client) ||
    typeof (client as Database).transaction !== "function"
  );
}
