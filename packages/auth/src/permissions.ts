import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  ownerAc,
  memberAc,
} from "better-auth/plugins/organization/access";

export const ac = createAccessControl({
  ...defaultStatements,
});

export const admin = ac.newRole({
  ...ownerAc.statements,
});

export const trainer = ac.newRole({
  ...memberAc.statements,
});

export const rider = ac.newRole({
  ...memberAc.statements,
});

export const guardian = ac.newRole({
  ...memberAc.statements,
});
