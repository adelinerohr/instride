import type {
  GetMemberResponse,
  GetRiderResponse,
  GetTrainerResponse,
  ListMembersResponse,
  ListRidersResponse,
  ListTrainersResponse,
} from "@instride/api/contracts";
import { api, APIError } from "encore.dev/api";

import { requireAuth, requireOrganizationAuth } from "@/shared/auth";

import { memberService } from "./member.service";

export const listMembers = api(
  { method: "GET", path: "/members", expose: true, auth: true },
  async (): Promise<ListMembersResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const rows = await memberService.findMany(organizationId);

    return { members: rows };
  }
);

export const listRiders = api(
  { method: "GET", path: "/riders", expose: true, auth: true },
  async (): Promise<ListRidersResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const rows = await memberService.findManyRiders(organizationId);

    return { riders: rows };
  }
);

export const listTrainers = api(
  { method: "GET", path: "/trainers", expose: true, auth: true },
  async (): Promise<ListTrainersResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const rows = await memberService.findManyTrainers(organizationId);

    return { trainers: rows };
  }
);

export const getMember = api(
  { method: "GET", path: "/members/me", expose: true, auth: true },
  async (): Promise<GetMemberResponse> => {
    const { userID, organizationId } = requireAuth();

    if (!organizationId) {
      throw APIError.notFound("Member not found");
    }

    const row = await memberService.findOneByUser(userID, organizationId);
    return { member: row };
  }
);

export const getMemberById = api(
  { method: "GET", path: "/members/:id", expose: true, auth: true },
  async ({ id }: { id: string }): Promise<GetMemberResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const row = await memberService.findOne(id, organizationId);
    return { member: row };
  }
);

export const getRider = api(
  { method: "GET", path: "/riders/:id", expose: true, auth: true },
  async ({ id }: { id: string }): Promise<GetRiderResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const row = await memberService.findOneRider(id, organizationId);
    return { rider: row };
  }
);

export const getTrainer = api(
  { method: "GET", path: "/trainers/:id", expose: true, auth: true },
  async ({ id }: { id: string }): Promise<GetTrainerResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const row = await memberService.findOneTrainer(id, organizationId);
    return { trainer: row };
  }
);
