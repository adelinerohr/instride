const ROOT_KEY = "organizations";

export const organizationKeys = {
  all: [ROOT_KEY] as const,
  listByUser: (userId: string) => [ROOT_KEY, userId] as const,
  bySlug: (slug: string) => [ROOT_KEY, slug] as const,
  byId: (id: string) => [ROOT_KEY, id] as const,
  checkSlug: (slug: string) => [ROOT_KEY, "slug-check", slug] as const,

  // Invitations
  listInvitations: () => ["invitations"] as const,
  listUserInvitations: () => ["invitations", "user"] as const,

  // Levels
  listLevels: () => ["levels"] as const,
  levelById: (levelId: string) =>
    [...organizationKeys.listLevels(), levelId] as const,
};
