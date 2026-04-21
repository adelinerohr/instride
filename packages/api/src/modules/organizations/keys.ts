const ROOT = ["organizations"] as const;

export const organizationKeys = {
  all: () => ROOT,
  lists: () => [...ROOT, "list"] as const,
  listByUser: (userId: string) => [...ROOT, "list", "by-user", userId] as const,
  details: () => [...ROOT, "detail"] as const,
  byId: (id: string) => [...ROOT, "detail", "by-id", id] as const,
  bySlug: (slug: string) => [...ROOT, "detail", "by-slug", slug] as const,
  checkSlug: (slug: string) => [...ROOT, "slug-check", slug] as const,

  listInvitations: () => [...ROOT, "invitations"] as const,
  listUserInvitations: () => [...ROOT, "invitations", "user"] as const,

  listLevels: () => [...ROOT, "levels"] as const,
  levelById: (id: string) => [...ROOT, "levels", id] as const,
};
