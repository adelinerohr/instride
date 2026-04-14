import { defineRelationsPart } from "drizzle-orm";

import * as schema from "@/database/schema";

export const waiversRelations = defineRelationsPart(schema, (r) => ({
  waivers: {
    organization: r.one.organizations({
      from: r.waivers.organizationId,
      to: r.organizations.id,
    }),
    signature: r.one.waiverSignatures({
      from: r.waivers.id,
      to: r.waiverSignatures.waiverId,
    }),
  },
  waiverSignatures: {
    waiver: r.one.waivers({
      from: r.waiverSignatures.waiverId,
      to: r.waivers.id,
    }),
    signer: r.one.members({
      from: r.waiverSignatures.signerMemberId,
      to: r.members.id,
    }),
    onBehalfOf: r.one.members({
      from: r.waiverSignatures.onBehalfOfMemberId,
      to: r.members.id,
    }),
    organization: r.one.organizations({
      from: r.waiverSignatures.organizationId,
      to: r.organizations.id,
    }),
  },
}));
