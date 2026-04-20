import { api, APIError } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const instrideDb = SQLDatabase.named("instride");

export const dbDebug = api(
  { method: "GET", path: "/auth/_debug/db", expose: true },
  async () => {
    try {
      const result = await instrideDb.queryRow<{ ok: number }>`SELECT 1 as ok`;
      return { status: "ok", result };
    } catch (err) {
      throw APIError.internal(err instanceof Error ? err.message : String(err));
    }
  }
);
