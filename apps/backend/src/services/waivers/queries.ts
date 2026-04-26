import {
  GetSignatureResponse,
  GetWaiverResponse,
  ListSignaturesRequest,
  ListSignaturesResponse,
  ListWaiversResponse,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { waiverService } from "./service";

export const listWaivers = api(
  {
    method: "GET",
    path: "/organizations/:organizationId/waivers",
    expose: true,
    auth: true,
  },
  async (params: { organizationId: string }): Promise<ListWaiversResponse> => {
    const waivers = await waiverService.findMany(params.organizationId);
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
  async (params: { id: string }): Promise<GetWaiverResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const waiver = await waiverService.findOne(params.id, organizationId);
    return { waiver };
  }
);

export const listSignatures = api(
  {
    method: "GET",
    path: "/waivers/:id/signatures",
    expose: true,
    auth: true,
  },
  async (request: ListSignaturesRequest): Promise<ListSignaturesResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const signatures = await waiverService.findManySignatures(
      request.id,
      organizationId,
      request.signerMemberId
    );
    return { signatures };
  }
);

export const getSignature = api(
  {
    method: "GET",
    path: "/waivers/:id/signatures/:signatureId",
    expose: true,
    auth: true,
  },
  async (params: {
    id: string;
    signatureId: string;
  }): Promise<GetSignatureResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const signature = await waiverService.findOneSignature({
      organizationId,
      waiverId: params.id,
      id: params.signatureId,
    });
    return { signature };
  }
);
