import type { RouterClient } from "@orpc/server";

import { publicProcedure } from "../procedures";
import { invitationsRouter } from "./invitations";
import { membersRouter } from "./members";
import { organizationsRouter } from "./organizations";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => "OK"),
  organizations: organizationsRouter,
  members: membersRouter,
  invitations: invitationsRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<AppRouter>;
