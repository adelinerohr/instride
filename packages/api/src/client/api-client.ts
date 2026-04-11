import Client, { Local } from "./encore-client";

export const serverBaseURL = Local;

type Fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>;

let _instance: Client = new Client(serverBaseURL, {
  requestInit: {
    credentials: "include",
  },
});

// Proxy ensures all importers always see the current instance after
// configureApiClient() is called (e.g. from the mobile app at startup).
export const apiClient: Client = new Proxy({} as Client, {
  get(_target, prop: string | symbol) {
    return (_instance as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export function configureApiClient(options: {
  baseURL?: string;
  fetcher?: Fetcher;
}) {
  _instance = new Client(options.baseURL ?? serverBaseURL, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetcher: options.fetcher as any,
    requestInit: {
      credentials: "include",
    },
  });
}
