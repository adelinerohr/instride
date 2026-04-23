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

  it("should create a placeholder dependent for a guardian", async () => {
    const org = await seedOrganization();
    const { member: guardianMember } = await seedMember(
      org.id,
      org.authOrganizationId,
      { roles: [MembershipRole.GUARDIAN] }
    );

    signInAs(guardianMember.userId, org.id);

    const result = await createPlaceholderRelationship({
      placeholderProfile: {
        name: "Alex",
        dateOfBirth: "2015-06-01",
      },
      permissions: {},
    });

    expect(result.guardianMemberId).toBe(guardianMember.id);
    expect(result.status).toBe(GuardianRelationshipStatus.ACTIVE);
  });

  describe("permissions", () => {
    it("rejects callers who aren't guardians in the org", async () => {
      const org = await seedOrganization();
      const { user } = await seedMember(org.id, org.authOrganizationId, {
        roles: [MembershipRole.RIDER], // not a guardian
      });
      await signInAs(user.id, org.id);

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
      await signInAs(user.id, org.id);

      await expect(
        createPlaceholderRelationship({
          placeholderProfile: { name: "Alex", dateOfBirth: "2015-06-01" },
          permissions: {},
        })
      ).rejects.toThrow(/Guardian member not found/);
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
      await signInAs(guardian.id, org.id);

      const result = await createPlaceholderRelationship({
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

      expect(result.status).toBe(GuardianRelationshipStatus.ACTIVE);
      expect(result.guardianMemberId).toBe(guardianMember.id);
      expect(result.coppaConsentGiven).toBe(true);

      const dependent = await db.query.members.findFirst({
        where: { id: result.dependentMemberId },
      });
      expect(dependent?.isPlaceholder).toBe(true);
      expect(dependent?.roles).toEqual([MembershipRole.RIDER]);

      const rider = await db.query.riders.findFirst({
        where: { memberId: dependent!.id },
      });
      expect(rider?.isRestricted).toBe(true);
    });

    it("generates a placeholder email when none is provided", async () => {
      const org = await seedOrganization();
      const { user: guardian } = await seedMember(
        org.id,
        org.authOrganizationId,
        { roles: [MembershipRole.GUARDIAN] }
      );
      await signInAs(guardian.id, org.id);

      // Two calls with no email shouldn't collide
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
  });
});
