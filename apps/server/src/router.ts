import { invitationsRouter } from "@/routers/invitations";
import { membersRouter } from "@/routers/members";
import { organizationsRouter } from "@/routers/organizations";

export const router = {
  organizations: organizationsRouter,
  members: membersRouter,
  invitations: invitationsRouter,
};

export type AppRouter = typeof router;
