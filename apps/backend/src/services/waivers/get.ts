import { api, APIError } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { db } from "./db";
import {
  GetSignatureResponse,
  GetWaiverResponse,
  ListSignaturesResponse,
  ListWaiversResponse,
} from "./types/contracts";

export const listWaivers = api(
  {
    method: "GET",
    path: "/organizations/:organizationId/waivers",
    expose: true,
    auth: true,
  },
  async ({
    organizationId,
  }: {
    organizationId: string;
  }): Promise<ListWaiversResponse> => {
    const waivers = await db.query.waivers.findMany({
      where: { organizationId },
    });
    return { waivers };
  }
);

export const getWaiver = api(
  {
    method: "GET",
    path: "/waivers/:id",
    expose: true,
    auth: true,
  },
  async ({ id }: { id: string }): Promise<GetWaiverResponse> => {
    const waiver = await db.query.waivers.findFirst({
      where: { id },
      with: {
        signature: true,
      },
    });

    if (!waiver) {
      throw APIError.notFound("Waiver not found");
    }

    return { waiver };
  }
);

interface ListSignaturesRequest {
  waiverId: string;
  signerMemberId?: string;
}

export const listSignatures = api(
  {
    method: "GET",
    path: "/waivers/:waiverId/signatures",
    expose: true,
    auth: true,
  },
  async (request: ListSignaturesRequest): Promise<ListSignaturesResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const signatures = await db.query.waiverSignatures.findMany({
      where: {
        organizationId,
        waiverId: request.waiverId,
        ...(request.signerMemberId && {
          signerMemberId: request.signerMemberId,
        }),
      },
    });
    return { signatures };
  }
);

export const getSignatureForWaiver = api(
  {
    method: "GET",
    path: "/waivers/:id/signatures/:signatureId",
    expose: true,
    auth: true,
  },
  async ({
    id,
    signatureId,
  }: {
    id: string;
    signatureId: string;
  }): Promise<GetSignatureResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const signature = await db.query.waiverSignatures.findFirst({
      where: { organizationId, waiverId: id, id: signatureId },
    });
    if (!signature) {
      throw APIError.notFound("Signature not found");
    }
    return { signature };
  }
);
