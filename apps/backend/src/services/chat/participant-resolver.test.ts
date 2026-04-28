import { ConversationParticipantRole } from "@instride/shared";
import { APIError } from "encore.dev/api";
import { describe, expect, it } from "vitest";

import {
  resolveParticipantsForRider,
  resolveParticipantsForRiders,
} from "./participant-resolver";

const trainerId = "trainer-1";
const adminId = "admin-1";
const guardianAId = "guardian-a";
const guardianBId = "guardian-b";

// Four rider archetypes covering the full matrix
const adultRider = {
  id: "rider-adult",
  memberId: "member-adult",
  isRestricted: false,
  isPlaceholder: false,
};

const teenWithAccount = {
  id: "rider-teen",
  memberId: "member-teen",
  isRestricted: true,
  isPlaceholder: false,
};

const toddlerPlaceholder = {
  id: "rider-toddler",
  memberId: "member-toddler",
  isRestricted: true,
  isPlaceholder: true,
};

const corruptedRider = {
  id: "rider-bad",
  memberId: "member-bad",
  isRestricted: false,
  isPlaceholder: true, // placeholder without restricted = data corruption
};

describe("resolveParticipantsForRider", () => {
  describe("validation", () => {
    it("throws if no staff are provided", () => {
      expect(() =>
        resolveParticipantsForRider({
          rider: adultRider,
          guardianRelationships: [],
          staffMemberIds: [],
        })
      ).toThrow(APIError);
    });

    it("throws on placeholder-but-not-restricted (data corruption)", () => {
      expect(() =>
        resolveParticipantsForRider({
          rider: corruptedRider,
          guardianRelationships: [{ guardianMemberId: guardianAId }],
          staffMemberIds: [trainerId],
        })
      ).toThrow(APIError);
    });

    it("throws if a restricted rider has no guardians", () => {
      expect(() =>
        resolveParticipantsForRider({
          rider: teenWithAccount,
          guardianRelationships: [],
          staffMemberIds: [trainerId],
        })
      ).toThrow(APIError);
    });

    it("throws if a placeholder rider has no guardians", () => {
      expect(() =>
        resolveParticipantsForRider({
          rider: toddlerPlaceholder,
          guardianRelationships: [],
          staffMemberIds: [trainerId],
        })
      ).toThrow(APIError);
    });

    it("does NOT throw if an unrestricted adult has no guardians", () => {
      expect(() =>
        resolveParticipantsForRider({
          rider: adultRider,
          guardianRelationships: [],
          staffMemberIds: [trainerId],
        })
      ).not.toThrow();
    });
  });

  describe("adult rider (unrestricted, not placeholder)", () => {
    it("adds rider and staff", () => {
      const result = resolveParticipantsForRider({
        rider: adultRider,
        guardianRelationships: [],
        staffMemberIds: [trainerId],
      });

      expect(result).toHaveLength(2);
      expect(result).toContainEqual({
        memberId: adultRider.memberId,
        role: ConversationParticipantRole.RIDER,
      });
      expect(result).toContainEqual({
        memberId: trainerId,
        role: ConversationParticipantRole.STAFF,
      });
    });
  });

  describe("teen with own account (restricted, not placeholder)", () => {
    it("adds rider, staff, and guardians", () => {
      const result = resolveParticipantsForRider({
        rider: teenWithAccount,
        guardianRelationships: [{ guardianMemberId: guardianAId }],
        staffMemberIds: [trainerId],
      });

      expect(result).toHaveLength(3);
      expect(result).toContainEqual({
        memberId: teenWithAccount.memberId,
        role: ConversationParticipantRole.RIDER,
      });
      expect(result).toContainEqual({
        memberId: trainerId,
        role: ConversationParticipantRole.STAFF,
      });
      expect(result).toContainEqual({
        memberId: guardianAId,
        role: ConversationParticipantRole.GUARDIAN,
      });
    });
  });

  describe("toddler placeholder (restricted + placeholder)", () => {
    it("excludes the rider, includes only guardians + staff", () => {
      const result = resolveParticipantsForRider({
        rider: toddlerPlaceholder,
        guardianRelationships: [{ guardianMemberId: guardianAId }],
        staffMemberIds: [trainerId],
      });

      expect(result).toHaveLength(2);
      expect(
        result.find((p) => p.memberId === toddlerPlaceholder.memberId)
      ).toBeUndefined();
      expect(result.find((p) => p.memberId === guardianAId)?.role).toBe(
        ConversationParticipantRole.GUARDIAN
      );
    });

    it("includes all guardians", () => {
      const result = resolveParticipantsForRider({
        rider: toddlerPlaceholder,
        guardianRelationships: [
          { guardianMemberId: guardianAId },
          { guardianMemberId: guardianBId },
        ],
        staffMemberIds: [trainerId],
      });

      expect(result).toHaveLength(3);
      expect(
        result.filter((p) => p.role === ConversationParticipantRole.GUARDIAN)
      ).toHaveLength(2);
    });
  });

  describe("multiple staff", () => {
    it("includes all staff members", () => {
      const result = resolveParticipantsForRider({
        rider: adultRider,
        guardianRelationships: [],
        staffMemberIds: [trainerId, adminId],
      });

      expect(
        result.filter((p) => p.role === ConversationParticipantRole.STAFF)
      ).toHaveLength(2);
    });
  });

  describe("role priority on overlap", () => {
    it("staff role wins when a guardian is also staff", () => {
      const result = resolveParticipantsForRider({
        rider: adultRider,
        guardianRelationships: [{ guardianMemberId: trainerId }],
        staffMemberIds: [trainerId],
      });

      expect(result).toHaveLength(2);
      expect(result.find((p) => p.memberId === trainerId)?.role).toBe(
        ConversationParticipantRole.STAFF
      );
    });

    it("staff role wins when the rider is also staff", () => {
      const selfRider = {
        id: "rider-self",
        memberId: trainerId,
        isRestricted: false,
        isPlaceholder: false,
      };
      const result = resolveParticipantsForRider({
        rider: selfRider,
        guardianRelationships: [],
        staffMemberIds: [trainerId],
      });

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe(ConversationParticipantRole.STAFF);
    });

    it("guardian role wins over rider role for the same member", () => {
      // Defensive: data corruption where the rider is listed as their
      // own guardian. Guardian role wins via priority.
      const result = resolveParticipantsForRider({
        rider: adultRider,
        guardianRelationships: [{ guardianMemberId: adultRider.memberId }],
        staffMemberIds: [trainerId],
      });

      expect(result).toHaveLength(2);
      expect(result.find((p) => p.memberId === adultRider.memberId)?.role).toBe(
        ConversationParticipantRole.GUARDIAN
      );
    });
  });

  describe("dedup", () => {
    it("dedupes duplicate staff member ids", () => {
      const result = resolveParticipantsForRider({
        rider: adultRider,
        guardianRelationships: [],
        staffMemberIds: [trainerId, trainerId],
      });

      expect(result.filter((p) => p.memberId === trainerId)).toHaveLength(1);
    });

    it("dedupes duplicate guardians", () => {
      const result = resolveParticipantsForRider({
        rider: toddlerPlaceholder,
        guardianRelationships: [
          { guardianMemberId: guardianAId },
          { guardianMemberId: guardianAId },
        ],
        staffMemberIds: [trainerId],
      });

      expect(result.filter((p) => p.memberId === guardianAId)).toHaveLength(1);
    });
  });
});

describe("resolveParticipantsForRiders", () => {
  it("throws if no riders provided", () => {
    expect(() =>
      resolveParticipantsForRiders({
        riders: [],
        staffMemberIds: [trainerId],
      })
    ).toThrow(APIError);
  });

  it("merges participants across multiple riders", () => {
    // Adult sibling + toddler placeholder sibling, sharing parents.
    const result = resolveParticipantsForRiders({
      riders: [
        {
          rider: adultRider,
          guardianRelationships: [{ guardianMemberId: guardianAId }],
        },
        {
          rider: toddlerPlaceholder,
          guardianRelationships: [{ guardianMemberId: guardianAId }],
        },
      ],
      staffMemberIds: [trainerId],
    });

    // Expected: trainer (staff) + adultRider (rider) + guardianA
    // Toddler is excluded (placeholder), guardianA is deduped across both.
    expect(result).toHaveLength(3);
    expect(
      result.find((p) => p.memberId === toddlerPlaceholder.memberId)
    ).toBeUndefined();
    expect(result.filter((p) => p.memberId === guardianAId)).toHaveLength(1);
  });

  it("dedupes when same guardian appears for multiple dependents", () => {
    // Two toddler siblings sharing both parents
    const sibling1 = {
      ...toddlerPlaceholder,
      id: "sibling-1",
      memberId: "member-sibling-1",
    };
    const sibling2 = {
      ...toddlerPlaceholder,
      id: "sibling-2",
      memberId: "member-sibling-2",
    };

    const result = resolveParticipantsForRiders({
      riders: [
        {
          rider: sibling1,
          guardianRelationships: [
            { guardianMemberId: guardianAId },
            { guardianMemberId: guardianBId },
          ],
        },
        {
          rider: sibling2,
          guardianRelationships: [
            { guardianMemberId: guardianAId },
            { guardianMemberId: guardianBId },
          ],
        },
      ],
      staffMemberIds: [trainerId],
    });

    // Expected: 1 staff + 2 guardians = 3 participants total
    expect(result).toHaveLength(3);
    expect(
      result.filter((p) => p.role === ConversationParticipantRole.GUARDIAN)
    ).toHaveLength(2);
    expect(
      result.filter((p) => p.role === ConversationParticipantRole.RIDER)
    ).toHaveLength(0);
  });

  it("includes both teen riders when both have own accounts", () => {
    const teen1 = { ...teenWithAccount, id: "t1", memberId: "m-t1" };
    const teen2 = { ...teenWithAccount, id: "t2", memberId: "m-t2" };

    const result = resolveParticipantsForRiders({
      riders: [
        {
          rider: teen1,
          guardianRelationships: [{ guardianMemberId: guardianAId }],
        },
        {
          rider: teen2,
          guardianRelationships: [{ guardianMemberId: guardianAId }],
        },
      ],
      staffMemberIds: [trainerId],
    });

    // 1 staff + 2 riders + 1 guardian (deduped) = 4
    expect(result).toHaveLength(4);
    expect(
      result.filter((p) => p.role === ConversationParticipantRole.RIDER)
    ).toHaveLength(2);
  });
});
