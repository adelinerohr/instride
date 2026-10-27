import { MembershipRole } from "@instride/shared";
import { ORPCError } from "@orpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { members, organizations } from "@/db/schema/organizations";
import { authedProcedure, publicProcedure, requireRoles } from "@/orpc";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slugSchema = z
  .string()
  .min(3)
  .max(48)
  .regex(SLUG_PATTERN, "Lowercase letters, numbers and dashes only");

const optionalText = z.string().trim().max(500).nullable().optional();

const createInput = z.object({
  name: z.string().trim().min(1).max(120),
  slug: slugSchema,
  timezone: z.string().min(1),
});

const updateInput = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  timezone: z.string().min(1).optional(),
  logoUrl: optionalText,
  primaryColor: optionalText,
  phone: optionalText,
  website: optionalText,
  facebook: optionalText,
  instagram: optionalText,
  youtube: optionalText,
  tiktok: optionalText,
  addressLine1: optionalText,
  addressLine2: optionalText,
  city: optionalText,
  state: optionalText,
  postalCode: optionalText,
  allowSameDayBookings: z.boolean().optional(),
  allowPublicJoin: z.boolean().optional(),
});

/** Create an organization. The creator becomes its first admin. */
const create = authedProcedure
  .input(createInput)
  .handler(async ({ input, context }) => {
    const taken = await db.query.organizations.findFirst({
      where: { slug: input.slug },
      columns: { id: true },
    });
    if (taken) {
      throw new ORPCError("CONFLICT", { message: "That URL is already taken" });
    }

    return await db.transaction(async (tx) => {
      const [organization] = await tx
        .insert(organizations)
        .values(input)
        .returning();
      if (!organization) {
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }

      const [member] = await tx
        .insert(members)
        .values({
          organizationId: organization.id,
          userId: context.user.id,
          roles: [MembershipRole.ADMIN],
          onboardingComplete: true,
        })
        .returning();

      return { organization, member };
    });
  });

/** Public: used to resolve a barn's subdomain or join page. */
const bySlug = publicProcedure
  .input(z.object({ slug: z.string() }))
  .handler(async ({ input }) => {
    const organization = await db.query.organizations.findFirst({
      where: { slug: input.slug },
    });
    if (!organization) {
      throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
    }
    return organization;
  });

/** Every organization the signed-in user belongs to, with their roles. */
const mine = authedProcedure.handler(async ({ context }) => {
  return await db
    .select({
      organization: organizations,
      memberId: members.id,
      roles: members.roles,
    })
    .from(members)
    .innerJoin(organizations, eq(organizations.id, members.organizationId))
    .where(and(eq(members.userId, context.user.id), isNull(members.deletedAt)))
    .orderBy(organizations.name);
});

/** Update the current organization (from the X-Organization-Id header). */
const update = requireRoles(MembershipRole.ADMIN)
  .input(updateInput)
  .handler(async ({ input, context }) => {
    const [organization] = await db
      .update(organizations)
      .set(input)
      .where(eq(organizations.id, context.organization.id))
      .returning();
    return organization;
  });

export const organizationsRouter = { create, bySlug, mine, update };
