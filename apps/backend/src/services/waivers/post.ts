import { WaiverStatus } from "@instride/shared";
import { eq } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { db } from "@/database";
import { requireOrganizationAuth } from "@/shared/auth";

import { waivers, waiverSignatures } from "./schema";
import { GetSignatureResponse, GetWaiverResponse } from "./types/contracts";

interface CreateWaiverRequest {
  title: string;
  content: string;
}

export const createWaiver = api(
  {
    method: "POST",
    path: "/waivers",
    expose: true,
    auth: true,
  },
  async (request: CreateWaiverRequest): Promise<GetWaiverResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const [waiver] = await db
      .insert(waivers)
      .values({ ...request, organizationId, version: "1" })
      .returning();

    return { waiver };
  }
);

interface UpdateWaiverRequest extends Partial<CreateWaiverRequest> {
  waiverId: string;
}

export const updateWaiver = api(
  {
    method: "PUT",
    path: "/waivers/:waiverId",
    expose: true,
    auth: true,
  },
  async (request: UpdateWaiverRequest): Promise<GetWaiverResponse> => {
    const [waiver] = await db
      .update(waivers)
      .set(request)
      .where(eq(waivers.id, request.waiverId))
      .returning();

    return { waiver };
  }
);

export const archiveWaiver = api(
  {
    method: "DELETE",
    path: "/waivers/:waiverId/archive",
    expose: true,
    auth: true,
  },
  async ({ waiverId }: { waiverId: string }): Promise<void> => {
    await db
      .update(waivers)
      .set({ status: WaiverStatus.ARCHIVED })
      .where(eq(waivers.id, waiverId));
  }
);

interface SignWaiverRequest {
  waiverId: string;
  onBehalfOfMemberId?: string | null;
}

export const signWaiver = api(
  {
    method: "POST",
    path: "/waivers/:waiverId/sign",
    expose: true,
    auth: true,
  },
  async (request: SignWaiverRequest): Promise<GetSignatureResponse> => {
    const waiver = await db.query.waivers.findFirst({
      where: {
        id: request.waiverId,
      },
    });

    if (!waiver) {
      throw APIError.notFound("Waiver not found");
    }

    const { member } = await organizations.getMember();

    // Check for existing valid signature
    const existing = await db.query.waiverSignatures.findFirst({
      where: {
        waiverId: request.waiverId,
        signerMemberId: member.id,
        isValid: true,
        onBehalfOfMemberId: request.onBehalfOfMemberId ?? undefined,
      },
    });

    if (existing) {
      throw APIError.alreadyExists("Waiver signature already exists");
    }

    const [signature] = await db
      .insert(waiverSignatures)
      .values({
        organizationId: waiver.organizationId,
        waiverId: request.waiverId,
        signerMemberId: member.id,
        onBehalfOfMemberId: request.onBehalfOfMemberId ?? undefined,
        waiverVersion: waiver.version,
      })
      .returning();

    return { signature };
  }
);
