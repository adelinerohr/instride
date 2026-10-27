import { list } from "./procedures/list";
import { me } from "./procedures/me";
import { remove } from "./procedures/remove";
import { setRoles } from "./procedures/set-roles";

export const membersRouter = { me, list, setRoles, remove };
