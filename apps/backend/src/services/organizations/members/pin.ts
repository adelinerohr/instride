import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { and, eq } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { db } from "../db";
import { members } from "../schema";
import { GetMemberResponse } from "../types/contracts";
import { Member } from "../types/models";
import { getMember } from "./get";

const scrypt = promisify(_scrypt);

const SCRYPT_KEYLEN = 64;

// Pin must be 4 digits
function validatePinFormat(pin: string) {
  if (!/^[0-9]{4}$/.test(pin)) {
    throw APIError.invalidArgument("PIN must be 4 digits");
  }
}

export async function hashKioskPin(pin: string): Promise<string> {
  validatePinFormat(pin);

  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(pin, salt, SCRYPT_KEYLEN)) as Buffer;

  // Versioned format for future upgrades
  return `s1:${salt}:${derived.toString("hex")}`;
}

export async function verifyKioskPin(input: {
  pin: string;
  organizationId: string;
  memberId: string;
}): Promise<{
  ok: boolean;
  member: Member;
}> {
  const member = await db.query.members.findFirst({
    where: {
      id: input.memberId,
      organizationId: input.organizationId,
    },
  });

  if (!member) {
    throw APIError.notFound("Member not found");
  }

  if (!member.kioskPin) {
    return { ok: false, member };
  }

  const [version, salt, hashHex] = member.kioskPin.split(":");
  if (version !== "s1" || !salt || !hashHex) {
    return { ok: false, member };
  }

  const derived = (await scrypt(input.pin, salt, SCRYPT_KEYLEN)) as Buffer;
  const stored = Buffer.from(hashHex, "hex");

  if (stored.length !== derived.length) {
    return { ok: false, member };
  }

  return { ok: timingSafeEqual(stored, derived), member };
}

interface SetKioskPinRequest {
  pin: string;
}

export const setKioskPin = api(
  {
    method: "POST",
    path: "/members/pin",
    expose: true,
    auth: true,
  },
  async (request: SetKioskPinRequest): Promise<GetMemberResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await getMember();

    const pinHash = await hashKioskPin(request.pin);

    const [updatedMember] = await db
      .update(members)
      .set({
        kioskPin: pinHash,
      })
      .where(
        and(
          eq(members.id, member.id),
          eq(members.organizationId, organizationId)
        )
      )
      .returning();

    return { member: updatedMember };
  }
);
