import type { auth } from "#client";

const rootKey = ["auth"] as const;

export const authKeys = {
  session: [...rootKey, "session"] as const,
  user: (userId?: string) => [...rootKey, "user", userId] as const,
  listAccounts: (userId?: string) =>
    [...authKeys.user(userId), "accounts"] as const,
  accountInfo: (userId?: string) =>
    [...authKeys.user(userId), "accountInfo"] as const,
};

export const adminKeys = {
  users: (params: auth.ListUsersParams) =>
    [...rootKey, "admin", "users", params] as const,
};
