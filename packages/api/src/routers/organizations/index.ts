import { bySlug } from "./procedures/by-slug";
import { create } from "./procedures/create";
import { mine } from "./procedures/mine";
import { update } from "./procedures/update";

export const organizationsRouter = { create, bySlug, mine, update };
