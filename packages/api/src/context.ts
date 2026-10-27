import type { Session } from "@instride/auth";
import type { Database } from "@instride/db";

/** Built per request by apps/server (see its context.ts). */
export interface Context {
  db: Database;
  session: Session | null;
  headers: Headers;
}
