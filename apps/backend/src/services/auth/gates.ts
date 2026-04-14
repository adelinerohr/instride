import { MembershipRole } from "@instride/shared";
import { APIError } from "encore.dev/api";

import { db } from "@/database";

export async function assertAdmin(
  organizationId: string,
  userId: string
): Promise<void> {
  const member = await db.query.members.findFirst({
    where: {
      userId,
      organizationId,
    },
  });

  if (!member || !member.roles.includes(MembershipRole.ADMIN)) {
    throw APIError.permissionDenied("Admin access required");
  }
}

export async function assertAdminOrSelf(
  organizationId: string,
  userId: string,
  trainerId: string
): Promise<void> {
  const member = await db.query.members.findFirst({
    where: {
      userId,
      organizationId,
    },
  });

  if (!member) {
    throw APIError.notFound("Member not found");
  }

  if (member.roles.includes(MembershipRole.ADMIN)) return;

  // Check if the requesting user owns this trainer profile
  const trainer = await db.query.trainers.findFirst({
    where: {
      id: trainerId,
      organizationId,
    },
  });

  if (!trainer) {
    throw APIError.notFound("Trainer not found");
  }

  if (trainer.memberId !== member.id) {
    throw APIError.permissionDenied(
      "You are not authorized to access this trainer's settings"
    );
  }
}
