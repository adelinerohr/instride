import Client, { Local } from "./encore-client";

export const serverBaseURL = Local;

export const apiClient = new Client(serverBaseURL, {
  requestInit: {
    credentials: "include",
  },
});
