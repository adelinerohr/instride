import type {
  GetRiderResponse,
  GetTrainerResponse,
  UpdateTrainerRequest,
  UpdateRiderRequest,
  CreateTrainerRequest,
  CreateRiderRequest,
  ChangeRoleRequest,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { auth } from "@/services/auth/auth";
import { buildSessionCookieHeader } from "@/services/auth/session-cookie";
import { requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { db } from "../db";
import { organizationService } from "../organization.service";
import { memberService } from "./member.service";

export const createRider = api(
  { expose: true, method: "POST", path: "/riders", auth: true },
  async (request: CreateRiderRequest): Promise<GetRiderResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const created = await memberService.createRider({
      ...request,
      organizationId,
    });

    const rider = await memberService.findOneRider(created.id, organizationId);
    return { rider: rider };
  }
);

export const createTrainer = api(
  { expose: true, method: "POST", path: "/trainers", auth: true },
  async (request: CreateTrainerRequest): Promise<GetTrainerResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const created = await memberService.createTrainer({
      ...request,
      organizationId,
    });

    const trainer = await memberService.findOneTrainer(
      created.id,
      organizationId
    );
    return { trainer: trainer };
  }
);

export const completeOnboarding = api(
  {
    expose: true,
    method: "POST",
    path: "/members/:memberId/complete-onboarding",
    auth: true,
  },
  async ({ memberId }: { memberId: string }): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();

    await memberService.update(memberId, organizationId, {
      onboardingComplete: true,
    });
  }
);

export const changeRole = api(
  { expose: true, method: "PUT", path: "/members/:memberId/role", auth: true },
  async (params: ChangeRoleRequest): Promise<void> => {
    const { token, organizationId } = requireOrganizationAuth();

    const existing = await memberService.findOne(
      params.memberId,
      organizationId
    );
    const organization = await organizationService.findOne(organizationId);

    const authMember = await db.query.authMembers.findFirst({
      where: { id: existing.authMemberId },
    });
    assertExists(authMember, "Auth member not found");

    // Preserve owner role if present
    let newRoles: string[] = params.roles;
    if (authMember.role.includes("owner")) {
      newRoles = [...newRoles, "owner"];
    }

    await auth.api.updateMemberRole({
      headers: new Headers({
        cookie: buildSessionCookieHeader(token),
      }),
      body: {
        organizationId: organization.authOrganizationId,
        memberId: existing.authMemberId,
        role: newRoles,
      },
    });

    await memberService.update(params.memberId, organizationId, {
      roles: params.roles,
    });

    await memberService.syncTrainer(
      params.memberId,
      organizationId,
      params.roles
    );
    await memberService.syncRider(
      params.memberId,
      organizationId,
      params.roles
    );
  }
);

export const updateRider = api(
  { expose: true, method: "PUT", path: "/riders/:riderId", auth: true },
  async (request: UpdateRiderRequest): Promise<GetRiderResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { riderId, ...data } = request;

    await memberService.updateRider(riderId, organizationId, data);

    const rider = await memberService.findOneRider(riderId, organizationId);
    return { rider: rider };
  }
);

export const updateTrainer = api(
  { expose: true, method: "PUT", path: "/trainers/:trainerId", auth: true },
  async (request: UpdateTrainerRequest): Promise<GetTrainerResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { trainerId, ...data } = request;

    await memberService.updateTrainer(trainerId, organizationId, data);

    const trainer = await memberService.findOneTrainer(
      trainerId,
      organizationId
    );
    return { trainer: trainer };
  }
);
