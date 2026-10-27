import { serve } from "@hono/node-server";
import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { auth, trustedOrigins } from "@/auth";
import { env } from "@/env";
import { ORG_HEADER } from "@/orpc";
import { router } from "@/router";

const app = new Hono();

/** Turn "https://*.instrideapp.com" style entries into a matcher. */
function isTrustedOrigin(origin: string): boolean {
  return trustedOrigins.some((pattern) => {
    if (!pattern.includes("*")) {
      return pattern === origin;
    }
    const [prefix, suffix] = pattern.split("*") as [string, string];
    return origin.startsWith(prefix) && origin.endsWith(suffix);
  });
}

app.use(logger());
app.use(
  "*",
  cors({
    origin: (origin) => (isTrustedOrigin(origin) ? origin : null),
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization", ORG_HEADER],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.get("/health", (c) => c.json({ ok: true }));

app.on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw));

const rpcHandler = new RPCHandler(router);

app.use("/rpc/*", async (c, next) => {
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: { headers: c.req.raw.headers },
  });
  if (matched) {
    return c.newResponse(response.body, response);
  }
  await next();
});

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.info(`Instride server listening on http://localhost:${info.port}`);
});
