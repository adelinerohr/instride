import { Rider } from "@instride/api/contracts";
import { APIError } from "encore.dev/api";

import { AuthUser } from "@/services/auth/types/models";

export function assertExists<T>(
  value: T | null | undefined,
  errorMessage?: string
): asserts value is T {
  if (!value) {
    throw APIError.notFound(errorMessage || "Resource not found");
  }
}

export function assertUnique<T>(
  value: T | null | undefined,
  errorMessage?: string
): asserts value is T {
  if (value) {
    throw APIError.alreadyExists(errorMessage || "Resource already exists");
  }
}

export function assertMember<T extends { authUser?: AuthUser | null }>(
  value: T | null | undefined,
  label = "Member"
): asserts value is T & { authUser: AuthUser } {
  assertExists(value, `${label} not found`);
  assertExists(value.authUser, `${label} auth user not found`);
}

export function assertMemberWithRider<
  T extends { authUser?: AuthUser | null; rider?: Rider | null },
>(
  value: T | null | undefined,
  label = "Member with Rider"
): asserts value is T & { rider: Rider } {
  assertMember(value, label);
  assertExists(value.rider, `${label} rider not found`);
}
