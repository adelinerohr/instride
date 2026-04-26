import { eq } from "drizzle-orm";

import {
  AuthMemberRow,
  authMembers,
  AuthUserRow,
  authUsers,
  NewAuthMemberRow,
  NewAuthUserRow,
} from "@/database/schema";
import { Database, Transaction } from "@/shared/utils/schema";
import { assertExists } from "@/shared/utils/validation";

import { db } from "./db";

export const createAuthService = (client: Database | Transaction = db) => ({
  // ==========================================================================
  // User
  // ==========================================================================

  createUser: async (data: NewAuthUserRow) => {
    const [user] = await client.insert(authUsers).values(data).returning();
    assertExists(user, "User not created");
    return user;
  },

  updateUser: async (id: string, data: Partial<AuthUserRow>) => {
    const [user] = await client
      .update(authUsers)
      .set(data)
      .where(eq(authUsers.id, id))
      .returning();
    assertExists(user, "User not updated");
    return user;
  },

  findOneUser: async (id: string) => {
    const user = await client.query.authUsers.findFirst({ where: { id } });
    assertExists(user, "User not found");
    return user;
  },

  // ==========================================================================
  // Member
  // ==========================================================================

  createMember: async (data: NewAuthMemberRow) => {
    const [member] = await client.insert(authMembers).values(data).returning();
    assertExists(member, "Member not created");
    return member;
  },

  updateMember: async (id: string, data: Partial<AuthMemberRow>) => {
    const [member] = await client
      .update(authMembers)
      .set(data)
      .where(eq(authMembers.id, id))
      .returning();
    assertExists(member, "Member not updated");
    return member;
  },

  findOneMember: async (id: string, organizationId: string) => {
    const member = await client.query.authMembers.findFirst({
      where: { id, organizationId },
    });
    assertExists(member, "Member not found");
    return member;
  },
});

export const authService = createAuthService();
