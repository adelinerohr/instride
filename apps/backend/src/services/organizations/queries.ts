import type {
  GetOrganizationResponse,
  ListOrganizationsResponse,
  ListMyOrganizationsResponse,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { auth } from "@/services/auth/auth";
import { requireAuth } from "@/shared/auth";

import { toOrganization } from "./mappers";
import { memberRepo } from "./members/member.repo";
import { organizationRepo } from "./organization.repo";

export const listOrganizations = api(
  { expose: true, method: "GET", path: "/organizations", auth: true },
  async (): Promise<ListOrganizationsResponse> => {
    const organizations = await organizationRepo.findMany();
    return { organizations: organizations.map(toOrganization) };
  }
);

export const listMyOrganizations = api(
  { expose: true, method: "GET", path: "/organizations/my", auth: true },
  async (): Promise<ListMyOrganizationsResponse> => {
    const { userID } = requireAuth();

    const memberships = await memberRepo.findManyByUser(userID);

    return {
      organizations: memberships.map((membership) => ({
        organization: toOrganization(membership.organization),
        roles: membership.roles,
      })),
    };
  }
);

export const getBySlug = api(
  {
    expose: true,
    method: "GET",
    path: "/organizations/by-slug/:slug",
    auth: false,
  },
  async ({ slug }: { slug: string }): Promise<GetOrganizationResponse> => {
    const organization = await organizationRepo.findOneBySlug(slug);
    return { organization: toOrganization(organization) };
  }
);

export const getById = api(
  { expose: true, method: "GET", path: "/organizations/:id", auth: false },
  async ({ id }: { id: string }): Promise<GetOrganizationResponse> => {
    const organization = await organizationRepo.findOne(id);
    return { organization: toOrganization(organization) };
  }
);

interface CheckSlugResponse {
  available: boolean;
}

export const checkSlug = api(
  {
    expose: true,
    method: "GET",
    path: "/organizations/check/:slug",
    auth: false,
  },
  async ({ slug }: { slug: string }): Promise<CheckSlugResponse> => {
    const existing = await organizationRepo.findOneBySlug(slug);
    if (existing) return { available: false };

    const result = await auth.api.checkOrganizationSlug({ body: { slug } });
    return { available: result?.status === true };
  }
);
