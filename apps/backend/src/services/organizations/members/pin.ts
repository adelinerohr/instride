import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import type { GetMemberResponse, Member } from "@instride/api/contracts";
import { api, APIError } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { memberRepo } from "./member.repo";
import { getMember } from "./queries";

const scrypt = promisify(_scrypt);
const SCRYPT_KEYLEN = 64;

function validatePinFormat(pin: string) {
  if (!/^[0-9]{4}$/.test(pin)) {
    throw APIError.invalidArgument("PIN must be 4 digits");
  }
}

export async function hashKioskPin(pin: string): Promise<string> {
  validatePinFormat(pin);
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(pin, salt, SCRYPT_KEYLEN)) as Buffer;
  return `s1:${salt}:${derived.toString("hex")}`;
}

export async function verifyKioskPin(input: {
  pin: string;
  organizationId: string;
  memberId: string;
}): Promise<{ ok: boolean; member: Member }> {
  const member = await memberRepo.findOne(input.memberId, input.organizationId);

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
  { expose: true, method: "POST", path: "/members/pin", auth: true },
  async (request: SetKioskPinRequest): Promise<GetMemberResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member: currentMember } = await getMember();

    const pinHash = await hashKioskPin(request.pin);

    await memberRepo.update(currentMember.id, organizationId, {
      kioskPin: pinHash,
    });

    const member = await memberRepo.findOne(currentMember.id, organizationId);
    return { member };
  }
);
