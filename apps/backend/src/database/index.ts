import { drizzle } from "drizzle-orm/node-postgres";
import { SQLDatabase } from "encore.dev/storage/sqldb";

import { activityRelations } from "@/services/activity/schema/relations";
import { eventsRelations } from "@/services/events/schema/relations";
import { kioskRelations } from "@/services/kiosk/schema/relations";
import { notificationsRelations } from "@/services/notifications/schema/relations";

import { authRelations } from "../services/auth/schema/relations";
import { availabilityRelations } from "../services/availability/schema/relations";
import { boardsRelations } from "../services/boards/schema/relations";
import { feedRelations } from "../services/feed/schema/relations";
import { guardiansRelations } from "../services/guardians/schema/relations";
import { lessonsRelations } from "../services/lessons/schema/relations";
import { organizationsRelations } from "../services/organizations/schema/relations";
import { questionnairesRelations } from "../services/questionnaires/schema/relations";
import { waiversRelations } from "../services/waivers/schema/relations";
import * as schema from "./schema";
import { mainRelations } from "./schema/relations";

export const DB = new SQLDatabase("instride", {
  migrations: {
    path: "./migrations",
    source: "drizzle/v1",
  },
});

export const db = drizzle(DB.connectionString, {
  schema,
  relations: {
    ...mainRelations,
    ...authRelations,
    ...organizationsRelations,
    ...boardsRelations,
    ...lessonsRelations,
    ...availabilityRelations,
    ...feedRelations,
    ...questionnairesRelations,
    ...guardiansRelations,
    ...waiversRelations,
    ...activityRelations,
    ...notificationsRelations,
    ...kioskRelations,
    ...eventsRelations,
  },
});
