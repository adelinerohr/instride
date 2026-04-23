import { sql } from "drizzle-orm";
import { vi } from "vitest";
import * as encoreAuth from "~encore/auth";

import { db } from "@/services/auth/db";

const TABLES_IN_TRUNCATE_ORDER = [
  "waiver_signatures",
  "questionnaire_responses",
  "board_assignments",
  "guardian_relationships",
  "riders",
  "trainers",
  "members",
  "auth_members",
  "auth_users",
  "auth_organizations",
  "waivers",
  "questionnaires",
  "organizations",
] as const;

export async function truncateAll() {
  await db.execute(
    sql.raw(
      `TRUNCATE TABLE ${TABLES_IN_TRUNCATE_ORDER.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE`
    )
  );
}

export function signInAs(userID: string, organizationId: string) {
  vi.spyOn(encoreAuth, "getAuthData").mockReturnValue({
    userID,
    organizationId,
  } as any);
}
