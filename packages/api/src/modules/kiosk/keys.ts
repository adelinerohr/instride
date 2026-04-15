export const kioskKeys = {
  list: () => ["kiosk"] as const,
  sessions: () => [...kioskKeys.list(), "sessions"] as const,
  session: (sessionId: string) => [...kioskKeys.sessions(), sessionId] as const,
};
