import { MembershipRole } from "@instride/shared";
import { generateId } from "better-auth";

import * as schema from "@/database/schema";

import { initDrizzle } from "../../database";

export const db = initDrizzle();

export async function seedOrganization(name = "Test Farm") {
  const [authOrg] = await db
    .insert(schema.authOrganizations)
    .values({
      id: generateId(),
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      timezone: "America/Chicago",
      createdAt: new Date(),
    })
    .returning();

  const [org] = await db
    .insert(schema.organizations)
    .values({
      name,
      authOrganizationId: authOrg.id,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      timezone: "America/Chicago",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return org;
}

export async function seedMember(
  organizationId: string,
  authOrganizationId: string,
  opts: {
    roles?: MembershipRole[];
    email?: string;
    name?: string;
  } = {}
) {
  const now = new Date();

  const [authUser] = await db
    .insert(schema.authUsers)
    .values({
      id: generateId(),
      email: opts.email ?? `${generateId()}@test.local`,
      name: opts.name ?? "Test User",
      emailVerified: true,
      role: "user",
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  const [authMember] = await db
    .insert(schema.authMembers)
    .values({
      id: generateId(),
      userId: authUser.id,
      organizationId: authOrganizationId,
      role: "member",
      createdAt: now,
    })
    .returning();

  const [member] = await db
    .insert(schema.members)
    .values({
      userId: authUser.id,
      organizationId,
      roles: opts.roles ?? [MembershipRole.GUARDIAN],
      authMemberId: authMember.id,
      isPlaceholder: false,
      onboardingComplete: true,
    })
    .returning();

  return { user: authUser, member, authMember };
}
