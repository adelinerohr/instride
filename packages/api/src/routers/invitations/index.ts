import { accept } from "./procedures/accept";
import { byToken } from "./procedures/by-token";
import { create } from "./procedures/create";
import { list } from "./procedures/list";
import { revoke } from "./procedures/revoke";

export const invitationsRouter = { create, list, revoke, byToken, accept };
