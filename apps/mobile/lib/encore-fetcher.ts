import * as SecureStore from "expo-secure-store";

// The @better-auth/expo plugin stores cookies under this key pattern.
// Matches the storagePrefix configured in lib/auth-client.ts.
const STORAGE_PREFIX =
  process.env.EXPO_PUBLIC_ORGANIZATION_SLUG ?? "instride";
const COOKIE_KEY = `${STORAGE_PREFIX}.cookie`;

/**
 * A fetch wrapper that reads the session cookie stored by @better-auth/expo
 * from Expo Secure Store and attaches it to every Encore API request.
 * It also persists any Set-Cookie header returned by the server.
 */
export const encoreFetcher = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const storedCookie = await SecureStore.getItemAsync(COOKIE_KEY);

  const headers = new Headers(init?.headers);
  if (storedCookie) {
    headers.set("Cookie", storedCookie);
  }

  const response = await fetch(input, { ...init, headers });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    await SecureStore.setItemAsync(COOKIE_KEY, setCookie);
  }

  return response;
};
