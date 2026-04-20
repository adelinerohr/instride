export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export type AllowedImageType = "image/jpeg" | "image/png" | "image/webp";

export function getUserAvatarPrefix(userId: string): string {
  return `users/profile-pictures/${userId}`;
}

export function getUserAvatarKey(userId: string): string {
  return `${getUserAvatarPrefix(userId)}/${crypto.randomUUID()}`;
}

export function getOrganizationLogoPrefix(organizationId: string): string {
  return `orgs/logos/${organizationId}/`;
}

export function getOrganizationLogoKey(organizationId: string): string {
  return `${getOrganizationLogoPrefix(organizationId)}${crypto.randomUUID()}`;
}

export function isAllowedContentType<T extends readonly string[]>(
  value: string,
  allowedTypes: T
): value is (typeof allowedTypes)[number] {
  return allowedTypes.includes(value);
}
