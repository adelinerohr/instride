import { api, APIError } from "encore.dev/api";

import { db } from "@/database";
import { auth } from "@/services/auth/auth";

import {
  GetOrganizationResponse,
  ListOrganizationsResponse,
} from "../types/contracts";

export const listOrganizations = api(
  {
    expose: true,
    method: "GET",
    path: "/organizations",
    auth: true,
  },
  async (): Promise<ListOrganizationsResponse> => {
    const organizations = await db.query.organizations.findMany();
    return { organizations };
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
    const organization = await db.query.organizations.findFirst({
      where: { slug },
    });
    if (!organization) {
      throw APIError.notFound("Organization not found");
    }
    return { organization };
  }
);

export const getById = api(
  {
    expose: true,
    method: "GET",
    path: "/organizations/:id",
    auth: false,
  },
  async ({ id }: { id: string }): Promise<GetOrganizationResponse> => {
    const organization = await db.query.organizations.findFirst({
      where: { id },
    });
    if (!organization) {
      throw APIError.notFound("Organization not found");
    }
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
    const existing = await db.query.organizations.findFirst({
      where: { slug },
    });

    if (existing) {
      return { available: false };
    }

    const result = await auth.api.checkOrganizationSlug({ body: { slug } });
    return { available: result?.status === true };
  }
);
