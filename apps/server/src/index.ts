import { serve } from "@hono/node-server";
import { ORGANIZATION_HEADER } from "@instride/api/middleware/organization.middleware";
import { appRouter } from "@instride/api/routers/index";
import { getTrustedOrigins } from "@instride/auth";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { createContext } from "./context";
import { ENV } from "./env";
import { auth } from "./services";

const trustedOrigins = getTrustedOrigins(ENV.NODE_ENV === "production");

/** Matches exact origins and "https://*.instrideapp.com" style wildcards. */
function isTrustedOrigin(origin: string): boolean {
  return trustedOrigins.some((pattern) => {
    if (!pattern.includes("*")) {
      return pattern === origin;
    }
    const [prefix = "", suffix = ""] = pattern.split("*");
    return origin.startsWith(prefix) && origin.endsWith(suffix);
  });
}

const app = new Hono();

app.use(logger());
app.use(
  "*",
  cors({
    origin: (origin) => (isTrustedOrigin(origin) ? origin : null),
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization", ORGANIZATION_HEADER],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.get("/health", (c) => c.json({ ok: true }));

app.on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw));

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [onError((error) => console.error(error))],
});

app.use("/rpc/*", async (c, next) => {
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: await createContext(c.req.raw),
  });
  if (matched) {
    return c.newResponse(response.body, response);
  }
  await next();
});

serve({ fetch: app.fetch, port: ENV.PORT }, (info) => {
  console.info(`Instride server listening on http://localhost:${info.port}`);
});
