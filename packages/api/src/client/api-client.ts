import Client, { Local, Environment, type BaseURL } from "./encore-client";

function getServerBaseURL(): BaseURL {
  const isProduction = process.env.NODE_ENV === "production";

  return isProduction ? Environment("prod") : Local;
}

export const serverBaseURL = getServerBaseURL();

export const apiClient = new Client(serverBaseURL, {
  requestInit: {
    credentials: "include",
  },
});
