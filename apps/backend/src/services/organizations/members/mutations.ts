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
import { organizationRepo } from "../organization.repo";
import { memberRepo } from "./member.repo";

export const createRider = api(
  { expose: true, method: "POST", path: "/riders", auth: true },
  async (request: CreateRiderRequest): Promise<GetRiderResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const created = await memberRepo.createRider({
      ...request,
      organizationId,
    });

    const rider = await memberRepo.findOneRider(created.id, organizationId);
    return { rider: rider };
  }
);

export const createTrainer = api(
  { expose: true, method: "POST", path: "/trainers", auth: true },
  async (request: CreateTrainerRequest): Promise<GetTrainerResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const created = await memberRepo.createTrainer({
      ...request,
      organizationId,
    });

    const trainer = await memberRepo.findOneTrainer(created.id, organizationId);
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

    await memberRepo.update(memberId, organizationId, {
      onboardingComplete: true,
    });
  }
);

export const changeRole = api(
  { expose: true, method: "PUT", path: "/members/:memberId/role", auth: true },
  async (params: ChangeRoleRequest): Promise<void> => {
    const { token, organizationId } = requireOrganizationAuth();

    const existing = await memberRepo.findOne(params.memberId, organizationId);
    const organization = await organizationRepo.findOne(organizationId);

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

    await memberRepo.update(params.memberId, organizationId, {
      roles: params.roles,
    });

    await memberRepo.syncTrainer(params.memberId, organizationId, params.roles);
    await memberRepo.syncRider(params.memberId, organizationId, params.roles);
  }
);

export const updateRider = api(
  { expose: true, method: "PUT", path: "/riders/:riderId", auth: true },
  async (request: UpdateRiderRequest): Promise<GetRiderResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { riderId, ...data } = request;

    await memberRepo.updateRider(riderId, organizationId, data);

    const rider = await memberRepo.findOneRider(riderId, organizationId);
    return { rider: rider };
  }
);

export const updateTrainer = api(
  { expose: true, method: "PUT", path: "/trainers/:trainerId", auth: true },
  async (request: UpdateTrainerRequest): Promise<GetTrainerResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { trainerId, ...data } = request;

    await memberRepo.updateTrainer(trainerId, organizationId, data);

    const trainer = await memberRepo.findOneTrainer(trainerId, organizationId);
    return { trainer: trainer };
  }
);
