import {
  CreateWaiverRequest,
  GetSignatureResponse,
  GetWaiverResponse,
  SignWaiverRequest,
  UpdateWaiverRequest,
} from "@instride/api/contracts";
import { api, APIError } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { memberRepo } from "../organizations/members/member.repo";
import { db } from "./db";
import { waiverService } from "./service";

export const createWaiver = api(
  {
    method: "POST",
    path: "/waivers",
    expose: true,
    auth: true,
  },
  async (request: CreateWaiverRequest): Promise<GetWaiverResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const waiver = await waiverService.create({
      ...request,
      organizationId,
      version: "1",
    });
    return { waiver };
  }
);

export const updateWaiver = api(
  {
    method: "PUT",
    path: "/waivers/:id",
    expose: true,
    auth: true,
  },
  async (request: UpdateWaiverRequest): Promise<GetWaiverResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const waiver = await waiverService.update(
      request.id,
      organizationId,
      request
    );
    return { waiver };
  }
);

export const archiveWaiver = api(
  {
    method: "DELETE",
    path: "/waivers/:id/archive",
    expose: true,
    auth: true,
  },
  async (params: { id: string }): Promise<GetWaiverResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const waiver = await waiverService.archive(params.id, organizationId);
    return { waiver };
  }
);

export const signWaiver = api(
  {
    method: "POST",
    path: "/waivers/:id/sign",
    expose: true,
    auth: true,
  },
  async (request: SignWaiverRequest): Promise<GetSignatureResponse> => {
    const { organizationId, userID } = requireOrganizationAuth();

    const waiver = await waiverService.findOne(request.id, organizationId);
    const member = await memberRepo.findOneByUser(userID, organizationId);

    const existing = await db.query.waiverSignatures.findFirst({
      where: {
        waiverId: request.id,
        organizationId,
        signerMemberId: member.id,
        onBehalfOfMemberId: request.onBehalfOfMemberId ?? undefined,
      },
    });

    if (existing) {
      throw APIError.alreadyExists("Signature already exists");
    }

    const signature = await waiverService.createSignature({
      organizationId,
      waiverId: request.id,
      signerMemberId: member.id,
      onBehalfOfMemberId: request.onBehalfOfMemberId ?? undefined,
      waiverVersion: waiver.version,
    });

    return { signature };
  }
);
