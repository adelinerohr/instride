import { OrganizationOptions } from "better-auth/plugins/organization";

import {
  ac,
  admin as adminRole,
  trainer,
  rider,
  guardian,
} from "./permissions";
import { organizationAdditionalFields } from "./schema";

export const organizationConfig: OrganizationOptions = {
  ac,
  roles: {
    admin: adminRole,
    trainer,
    rider,
    guardian,
  },
  schema: {
    organization: {
      modelName: "authOrganizations",
      additionalFields: organizationAdditionalFields,
    },
    member: {
      modelName: "authMembers",
    },
    invitation: {
      modelName: "authInvitations",
    },
  },
};
