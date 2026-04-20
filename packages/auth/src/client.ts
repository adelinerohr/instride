import {
  inferAdditionalFields,
  inferOrgAdditionalFields,
  organizationClient,
  adminClient,
} from "better-auth/client/plugins";
import { BetterAuthClientOptions } from "better-auth/types";

import {
  ac,
  admin as adminRole,
  trainer as trainerRole,
  rider as riderRole,
  guardian as guardianRole,
} from "./permissions";
import { Auth } from "./server";

export const clientOptions: BetterAuthClientOptions = {
  basePath: "/auth",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    adminClient(),
    inferAdditionalFields<Auth>(),
    organizationClient({
      schema: inferOrgAdditionalFields<Auth>(),
      ac: ac,
      roles: {
        admin: adminRole,
        trainer: trainerRole,
        rider: riderRole,
        guardian: guardianRole,
      },
    }),
  ],
};
