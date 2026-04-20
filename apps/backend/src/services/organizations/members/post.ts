import { MembershipRole } from "@instride/shared/models/enums";
import { and, eq } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";

import { auth } from "@/services/auth/auth";
import { requireAuth, requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { db } from "../db";
import { members, riders, trainers } from "../schema";
import {
  GetMemberResponse,
  GetRiderResponse,
  GetTrainerResponse,
} from "../types/contracts";

export const completeOnboarding = api(
  {
    expose: true,
    method: "POST",
    path: "/members/:memberId/complete-onboarding",
    auth: true,
  },
  async ({ memberId }: { memberId: string }): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();

    await db
      .update(members)
      .set({ onboardingComplete: true })
      .where(
        and(
          eq(members.id, memberId),
          eq(members.organizationId, organizationId)
        )
      );
  }
);

interface CreateRiderRequest {
  organizationId: string;
  memberId: string;
  isRestricted?: boolean;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  ridingLevelId?: string | null;
}

export const createRider = api(
  {
    expose: true,
    method: "POST",
    path: "/riders",
    auth: true,
  },
  async (request: CreateRiderRequest): Promise<GetRiderResponse> => {
    const [rider] = await db.insert(riders).values(request).returning();
    return { rider };
  }
);

interface CreateTrainerRequest {
  organizationId: string;
  memberId: string;
  bio?: string | null;
  allowSameDayBookings?: boolean;
}

export const createTrainer = api(
  {
    expose: true,
    method: "POST",
    path: "/trainers",
    auth: true,
  },
  async (request: CreateTrainerRequest): Promise<GetTrainerResponse> => {
    const [trainer] = await db.insert(trainers).values(request).returning();
    return { trainer };
  }
);

interface UpdateRiderRequest extends Partial<CreateRiderRequest> {
  riderId: string;
}

export const updateRider = api(
  {
    expose: true,
    method: "PUT",
    path: "/riders/:riderId",
    auth: true,
  },
  async (request: UpdateRiderRequest): Promise<GetRiderResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { riderId, ...data } = request;

    const [rider] = await db
      .update(riders)
      .set(data)
      .where(
        and(eq(riders.id, riderId), eq(riders.organizationId, organizationId))
      )
      .returning();

    return { rider };
  }
);

interface UpdateTrainerRequest extends Partial<CreateTrainerRequest> {
  trainerId: string;
}

export const updateTrainer = api(
  {
    expose: true,
    method: "PUT",
    path: "/trainers/:trainerId",
    auth: true,
  },
  async (request: UpdateTrainerRequest): Promise<GetTrainerResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { trainerId, ...data } = request;

    const [trainer] = await db
      .update(trainers)
      .set(data)
      .where(
        and(
          eq(trainers.id, trainerId),
          eq(trainers.organizationId, organizationId)
        )
      )
      .returning();

    return { trainer };
  }
);

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

interface ChangeRoleRequest {
  memberId: string;
  roles: MembershipRole[];
}

export const changeRole = api(
  {
    expose: true,
    method: "PUT",
    path: "/members/:memberId/role",
    auth: true,
  },
  async (request: ChangeRoleRequest): Promise<void> => {
    const { token, organizationId } = requireOrganizationAuth();
    const { memberId, roles } = request;

    const existing = await db.query.members.findFirst({
      where: { id: memberId },
    });

    const organization = await db.query.organizations.findFirst({
      where: { id: organizationId },
    });

    if (!organization) {
      throw APIError.notFound(`Organization "${organizationId}" not found`);
    }

    if (!existing) {
      throw APIError.notFound("Member not found");
    }

    const authMember = await db.query.authMembers.findFirst({
      where: { id: existing.authMemberId },
    });

    if (!authMember) {
      throw APIError.notFound("Member not found");
    }

    // Add owner role back in if the member is an owner
    let newRoles = roles as string[];
    if (authMember.role.includes("owner")) {
      newRoles = [...newRoles, "owner"];
    }

    // Update the member's roles in the Better Auth
    await auth.api.updateMemberRole({
      headers: new Headers({
        cookie: `better-auth.session_token=${token}`,
      }),
      body: {
        organizationId: organization.authOrganizationId,
        memberId: existing.authMemberId,
        role: newRoles,
      },
    });

    // Update the member's roles in the database
    await db.update(members).set({ roles }).where(eq(members.id, existing.id));

    // Sync profile tables
    if (roles.includes(MembershipRole.TRAINER)) {
      await db
        .insert(trainers)
        .values({ memberId, organizationId })
        .onConflictDoNothing();
    } else {
      await db
        .update(trainers)
        .set({ deletedAt: new Date() })
        .where(eq(trainers.memberId, memberId));
    }

    if (roles.includes(MembershipRole.RIDER)) {
      await db
        .insert(riders)
        .values({ memberId, organizationId })
        .onConflictDoNothing();
    } else {
      await db
        .update(riders)
        .set({ deletedAt: new Date() })
        .where(eq(riders.memberId, memberId));
    }
  }
);

interface JoinOrganizationRequest {
  organizationId: string;
  roles?: MembershipRole[];
}

export const joinOrganization = api(
  {
    expose: true,
    method: "POST",
    path: "/organizations/:organizationId/join",
    auth: true,
  },
  async ({
    organizationId,
    roles,
  }: JoinOrganizationRequest): Promise<GetMemberResponse> => {
    const { userID, session } = requireAuth();

    const email = session?.user?.email;

    if (!email) {
      throw APIError.permissionDenied(
        "You must be logged in to join an organization"
      );
    }

    const organization = await db.query.organizations.findFirst({
      where: { id: organizationId },
    });

    assertExists(organization, "Organization not found");

    if (!organization.allowPublicJoin) {
      throw APIError.permissionDenied(
        "This organization does not allow public join"
      );
    }

    const existing = await db.query.members.findFirst({
      where: {
        userId: userID,
        organizationId: organization.id,
      },
    });

    if (existing) {
      return { member: existing };
    }

    const authMemberRow = await auth.api.addMember({
      body: {
        userId: userID,
        organizationId: organization.authOrganizationId,
        role: "rider",
      },
    });

    if (!authMemberRow) {
      throw APIError.internal("Failed to add member");
    }

    const [member] = await db
      .insert(members)
      .values({
        userId: userID,
        organizationId: organization.id,
        authMemberId: authMemberRow.id,
        roles: roles ?? [MembershipRole.RIDER],
      })
      .returning();

    return { member };
  }
);
