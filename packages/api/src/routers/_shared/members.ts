/** Columns of `users` that are safe to show other members. */
export const publicUserColumns = {
  id: true,
  name: true,
  email: true,
  image: true,
  phone: true,
} as const;

/** Members with a login use their account name; login-less dependents use members.name. */
export function displayName(member: {
  name: string | null;
  user?: { name: string } | null;
}): string {
  return member.user?.name ?? member.name ?? "Unknown";
}
