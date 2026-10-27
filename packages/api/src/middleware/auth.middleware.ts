import { ORPCError } from "@orpc/server";

import { o } from "../orpc";

/** Requires a signed-in user. Narrows `session` and adds `user`. */
export const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return await next({
    context: { session: context.session, user: context.session.user },
  });
});
