import type { Context } from "@instride/api/context";

import { auth, db } from "./services";

export async function createContext(request: Request): Promise<Context> {
  const session = await auth.api.getSession({ headers: request.headers });
  return { db, session, headers: request.headers };
}
