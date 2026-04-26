import {
  GuardianRelationshipStatus,
  MembershipRole,
} from "@instride/shared/models/enums";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { signInAs, truncateAll } from "@/shared/testing/db";
import { db, seedMember, seedOrganization } from "@/shared/testing/seed";

import { createPlaceholderRelationship } from "./placeholder";

describe("createPlaceholderRelationship", () => {
  beforeEach(async () => {
    await truncateAll();
    vi.restoreAllMocks();
  });

  describe("permissions", () => {
    it("rejects callers who aren't guardians in the org", async () => {
      const org = await seedOrganization();
      const { user } = await seedMember(org.id, org.authOrganizationId, {
        roles: [MembershipRole.RIDER], // not a guardian
      });
      signInAs(user.id, org.id);

      await expect(
        createPlaceholderRelationship({
          placeholderProfile: { name: "Alex", dateOfBirth: "2015-06-01" },
          permissions: {},
        })
      ).rejects.toMatchObject({ code: "permission_denied" });
    });

    it("rejects when the caller has no member row in this org", async () => {
      const org = await seedOrganization();
      const otherOrg = await seedOrganization("Other Farm");
      // User is a guardian in otherOrg, not in org
      const { user } = await seedMember(
        otherOrg.id,
        otherOrg.authOrganizationId,
        { roles: [MembershipRole.GUARDIAN] }
      );
      signInAs(user.id, org.id);

      await expect(
        createPlaceholderRelationship({
          placeholderProfile: { name: "Alex", dateOfBirth: "2015-06-01" },
          permissions: {},
        })
      ).rejects.toThrow(/Guardian member not found/);
    });

    it("rejects when the placeholder email is already in use", async () => {
      const org = await seedOrganization();
      const { user: guardian } = await seedMember(
        org.id,
        org.authOrganizationId,
        { roles: [MembershipRole.GUARDIAN] }
      );
      signInAs(guardian.id, org.id);

      // Pre-create a user with the email we'll try to use
      await seedMember(org.id, org.authOrganizationId, {
        email: "alex@example.com",
        roles: [MembershipRole.RIDER],
      });

      await expect(
        createPlaceholderRelationship({
          placeholderProfile: {
            name: "Alex",
            dateOfBirth: "2015-06-01",
            email: "alex@example.com",
          },
          permissions: {},
        })
      ).rejects.toMatchObject({ code: "already_exists" });
    });
  });

  describe("happy path", () => {
    it("creates the full dependent chain and an active relationship", async () => {
      const org = await seedOrganization();
      const { user: guardian, member: guardianMember } = await seedMember(
        org.id,
        org.authOrganizationId,
        { roles: [MembershipRole.GUARDIAN] }
      );
      signInAs(guardian.id, org.id);

      const { relationship } = await createPlaceholderRelationship({
        placeholderProfile: {
          name: "Alex Rider",
          dateOfBirth: "2015-06-01",
          phone: "+15555550100",
        },
        permissions: {
          bookings: {
            canBookLessons: true,
            canJoinEvents: true,
            requiresApproval: true,
            canCancel: true,
          },
        },
      });

      expect(relationship.status).toBe(GuardianRelationshipStatus.ACTIVE);
      expect(relationship.guardianMemberId).toBe(guardianMember.id);
      expect(relationship.coppaConsentGiven).toBe(true);
      expect(relationship.organizationId).toBe(org.id);

      const dependent = await db.query.members.findFirst({
        where: { id: relationship.dependentMemberId },
      });
      expect(dependent?.isPlaceholder).toBe(true);
      expect(dependent?.onboardingComplete).toBe(false);
      expect(dependent?.roles).toEqual([MembershipRole.RIDER]);

      const rider = await db.query.riders.findFirst({
        where: { memberId: dependent!.id },
      });
      expect(rider?.isRestricted).toBe(true);
    });

    it("merges caller-supplied permissions over defaults", async () => {
      const org = await seedOrganization();
      const { user: guardian } = await seedMember(
        org.id,
        org.authOrganizationId,
        { roles: [MembershipRole.GUARDIAN] }
      );
      signInAs(guardian.id, org.id);

      const { relationship } = await createPlaceholderRelationship({
        placeholderProfile: { name: "Alex", dateOfBirth: "2015-06-01" },
        permissions: {
          bookings: {
            canBookLessons: false,
            canJoinEvents: true,
            requiresApproval: true,
            canCancel: false,
          },
        },
      });

      expect(relationship.permissions.bookings.canBookLessons).toBe(false);
      expect(relationship.permissions.bookings.canJoinEvents).toBe(true);
    });

    it("generates a placeholder email when none is provided", async () => {
      const org = await seedOrganization();
      const { user: guardian } = await seedMember(
        org.id,
        org.authOrganizationId,
        { roles: [MembershipRole.GUARDIAN] }
      );
      signInAs(guardian.id, org.id);

      // Two calls with no email shouldn't collide on the placeholder
      // email's unique constraint.
      await createPlaceholderRelationship({
        placeholderProfile: { name: "Alex", dateOfBirth: "2015-06-01" },
        permissions: {},
      });
      await createPlaceholderRelationship({
        placeholderProfile: { name: "Sam", dateOfBirth: "2016-03-10" },
        permissions: {},
      });

      const riders = await db.query.riders.findMany();
      expect(riders).toHaveLength(2);
    });

    it("uses the provided placeholder email when given", async () => {
      const org = await seedOrganization();
      const { user: guardian } = await seedMember(
        org.id,
        org.authOrganizationId,
        { roles: [MembershipRole.GUARDIAN] }
      );
      signInAs(guardian.id, org.id);

      const { relationship } = await createPlaceholderRelationship({
        placeholderProfile: {
          name: "Alex",
          dateOfBirth: "2015-06-01",
          email: "alex@example.com",
        },
        permissions: {},
      });

      const dependent = await db.query.members.findFirst({
        where: { id: relationship.dependentMemberId },
        with: { authUser: true },
      });
      expect(dependent?.authUser?.email).toBe("alex@example.com");
    });
  });
});
