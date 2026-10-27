import { drizzle } from "drizzle-orm/node-postgres";

import { env } from "@/env";

import { relations, schema } from "./relations";

export const db = drizzle(env.DATABASE_URL, { schema, relations });

export type Db = typeof db;
/** A transaction handle, for helpers that should work inside or outside one. */
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
