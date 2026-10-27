import { createDependent } from "./procedures/create-dependent";
import { guardiansOf } from "./procedures/guardians-of";
import { inviteDependentLogin, inviteGuardian } from "./procedures/invite";
import { myDependents } from "./procedures/my-dependents";
import { revoke } from "./procedures/revoke";
import { updateDependent } from "./procedures/update-dependent";
import { updatePermissions } from "./procedures/update-permissions";

export const guardiansRouter = {
  createDependent,
  myDependents,
  guardiansOf,
  updateDependent,
  updatePermissions,
  revoke,
  inviteGuardian,
  inviteDependentLogin,
};
