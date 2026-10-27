import { createAuth } from "@instride/auth";
import { createDb } from "@instride/db";

import { ENV } from "./env";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
