import { eq } from "drizzle-orm";

import { Database, Transaction } from "@/shared/utils/schema";
import { assertExists } from "@/shared/utils/validation";

import { db } from "./db";
import { NewOrganizationRow, OrganizationRow, organizations } from "./schema";

export const createOrganizationRepo = (
  client: Database | Transaction = db
) => ({
  create: async (data: NewOrganizationRow) => {
    const [organization] = await client
      .insert(organizations)
      .values(data)
      .returning();
    assertExists(organization, "Organization not created");
    return organization;
  },

  findOne: async (id: string) => {
    const organization = await client.query.organizations.findFirst({
      where: { id },
    });
    assertExists(organization, "Organization not found");
    return organization;
  },

  findOneBySlug: async (slug: string) => {
    const organization = await client.query.organizations.findFirst({
      where: { slug },
    });
    assertExists(organization, "Organization not found");
    return organization;
  },

  findMany: async () => {
    const organizations = await client.query.organizations.findMany();
    return organizations;
  },

  update: async (id: string, data: Partial<OrganizationRow>) => {
    const [organization] = await client
      .update(organizations)
      .set(data)
      .where(eq(organizations.id, id))
      .returning();
    assertExists(organization, "Organization not updated");
    return organization;
  },
});

export const organizationRepo = createOrganizationRepo();
