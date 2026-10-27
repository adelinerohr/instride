import { drizzle } from "drizzle-orm/node-postgres";

import { relations } from "./relations";

export interface DatabaseConfig {
  DATABASE_URL: string;
}

/** Create the database client. Call once, in the server's services.ts. */
export function createDb(env: DatabaseConfig) {
  return drizzle(env.DATABASE_URL, { relations });
}

export type Database = ReturnType<typeof createDb>;

export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
