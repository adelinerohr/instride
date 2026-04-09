const rootKey = ["auth"] as const;

export const authKeys = {
  session: [...rootKey, "session"] as const,
  me: [...rootKey, "me"] as const,
};
