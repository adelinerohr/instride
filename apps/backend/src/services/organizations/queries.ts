import type {
  GetOrganizationResponse,
  ListOrganizationsResponse,
  ListMyOrganizationsResponse,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { auth } from "@/services/auth/auth";
import { requireAuth } from "@/shared/auth";

import { memberService } from "./members/member.service";
import { organizationService } from "./organization.service";

export const listOrganizations = api(
  { expose: true, method: "GET", path: "/organizations", auth: true },
  async (): Promise<ListOrganizationsResponse> => {
    const organizations = await organizationService.findMany();
    return { organizations };
  }
);

export const listMyOrganizations = api(
  { expose: true, method: "GET", path: "/organizations/my", auth: true },
  async (): Promise<ListMyOrganizationsResponse> => {
    const { userID } = requireAuth();

    const memberships = await memberService.findManyByUser(userID);

    return { organizations: memberships };
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
    const organization = await organizationService.findOneBySlug(slug);
    return { organization };
  }
);

export const getById = api(
  { expose: true, method: "GET", path: "/organizations/:id", auth: false },
  async ({ id }: { id: string }): Promise<GetOrganizationResponse> => {
    const organization = await organizationService.findOne(id);
    return { organization };
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
    const existing = await organizationService.findOneBySlug(slug);
    if (existing) return { available: false };

    const result = await auth.api.checkOrganizationSlug({ body: { slug } });
    return { available: result?.status === true };
  }
);
