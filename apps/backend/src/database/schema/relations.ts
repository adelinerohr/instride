import { defineRelationsPart } from "drizzle-orm";

import * as schema from "./index";

export const mainRelations = defineRelationsPart(schema);
