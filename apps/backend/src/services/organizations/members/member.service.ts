import { MembershipRole } from "@instride/shared";
import { and, eq } from "drizzle-orm";

import { Database, Transaction } from "@/shared/utils/schema";
import { assertExists } from "@/shared/utils/validation";

import { db } from "../db";
import {
  memberExpansion,
  riderExpansion,
  trainerExpansion,
} from "../fragments";
import { toMember, toRider, toTrainer } from "../mappers";
import {
  MemberRow,
  members,
  NewMemberRow,
  NewRiderRow,
  NewTrainerRow,
  RiderRow,
  riders,
  TrainerRow,
  trainers,
} from "../schema";

export const createMemberService = (client: Database | Transaction = db) => ({
  // ================================================================================
  // Members
  // ================================================================================

  create: async (data: NewMemberRow) => {
    const [created] = await client.insert(members).values(data).returning();
    assertExists(created, "Member not created");
    return created;
  },

  findOne: async (id: string, organizationId: string) => {
    const member = await client.query.members.findFirst({
      where: { id, organizationId },
      with: memberExpansion,
    });

    assertExists(member, "Member not found");
    return toMember(member);
  },

  findOneByUser: async (userId: string, organizationId: string) => {
    const member = await client.query.members.findFirst({
      where: { userId, organizationId },
      with: memberExpansion,
    });
    assertExists(member, "Member not found");
    return toMember(member);
  },

  findManyByUser: async (userId: string) => {
    const members = await client.query.members.findMany({
      where: { userId },
      with: {
        organization: true,
      },
    });
    return members.map((member) => {
      assertExists(member.organization, "Organization not found");
      return {
        organization: member.organization,
        roles: member.roles,
      };
    });
  },

  findMany: async (organizationId: string) => {
    const members = await client.query.members.findMany({
      where: { organizationId },
      with: memberExpansion,
    });
    return members.map(toMember);
  },

  update: async (
    id: string,
    organizationId: string,
    data: Partial<MemberRow>
  ) => {
    const [updated] = await client
      .update(members)
      .set(data)
      .where(
        and(eq(members.id, id), eq(members.organizationId, organizationId))
      )
      .returning();
    assertExists(updated, "Member not found");
    return updated;
  },

  // ================================================================================
  // Riders
  // ================================================================================

  createRider: async (data: NewRiderRow) => {
    const [created] = await client.insert(riders).values(data).returning();
    assertExists(created, "Rider not created");
    return created;
  },

  findOneRider: async (id: string, organizationId: string) => {
    const rider = await client.query.riders.findFirst({
      where: { id, organizationId },
      with: riderExpansion,
    });

    assertExists(rider, "Rider not found");
    return toRider(rider);
  },

  findManyRiders: async (organizationId: string) => {
    const riders = await client.query.riders.findMany({
      where: { organizationId },
      with: riderExpansion,
    });
    return riders.map(toRider);
  },

  updateRider: async (
    id: string,
    organizationId: string,
    data: Partial<RiderRow>
  ) => {
    const [updated] = await client
      .update(riders)
      .set(data)
      .where(and(eq(riders.id, id), eq(riders.organizationId, organizationId)))
      .returning();
    assertExists(updated, "Rider not found");
    return updated;
  },

  syncRider: async (
    memberId: string,
    organizationId: string,
    roles: MembershipRole[]
  ) => {
    if (roles.includes(MembershipRole.RIDER)) {
      await client
        .insert(riders)
        .values({ memberId, organizationId })
        .onConflictDoNothing();
    } else {
      await client
        .update(riders)
        .set({ deletedAt: new Date() })
        .where(eq(riders.memberId, memberId));
    }
  },

  // ================================================================================
  // Trainers
  // ================================================================================

  createTrainer: async (data: NewTrainerRow) => {
    const [created] = await client.insert(trainers).values(data).returning();
    assertExists(created, "Trainer not created");
    return created;
  },

  findOneTrainer: async (id: string, organizationId: string) => {
    const trainer = await client.query.trainers.findFirst({
      where: { id, organizationId },
      with: trainerExpansion,
    });

    assertExists(trainer, "Trainer not found");
    return toTrainer(trainer);
  },

  findManyTrainers: async (organizationId: string) => {
    const trainers = await client.query.trainers.findMany({
      where: { organizationId },
      with: trainerExpansion,
    });
    return trainers.map(toTrainer);
  },

  updateTrainer: async (
    id: string,
    organizationId: string,
    data: Partial<TrainerRow>
  ) => {
    const [updated] = await client
      .update(trainers)
      .set(data)
      .where(
        and(eq(trainers.id, id), eq(trainers.organizationId, organizationId))
      )
      .returning();
    assertExists(updated, "Trainer not found");
    return updated;
  },

  syncTrainer: async (
    memberId: string,
    organizationId: string,
    roles: MembershipRole[]
  ) => {
    if (roles.includes(MembershipRole.TRAINER)) {
      await client
        .insert(trainers)
        .values({ memberId, organizationId })
        .onConflictDoNothing();
    } else {
      await client
        .update(trainers)
        .set({ deletedAt: new Date() })
        .where(eq(trainers.memberId, memberId));
    }
  },
});

export const memberService = createMemberService();
