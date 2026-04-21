import { eq } from "drizzle-orm";
import { appMeta } from "encore.dev";
import { api, APIError, Cookie } from "encore.dev/api";
import log from "encore.dev/log";

import { requireAuth } from "@/shared/auth";

import { auth } from "./auth";
import { db } from "./db";
import { authUsers } from "./schema";
import { buildSessionCookieHeader } from "./session-cookie";
import { Session } from "./types/models";

// Better Auth expects a Web Request, but Encore raw endpoints receive
// a Node.js IncomingMessage. We convert between the two formats.
export const authRoutes = api.raw(
  {
    expose: true,
    method: "*",
    path: "/auth/*path",
    auth: false,
  },
  async (req, res) => {
    try {
      const environment = appMeta().environment;
      const isProduction = environment.type === "production";

      // Read the request body
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const body = Buffer.concat(chunks);

      // Build a Web Request from the Node.js request
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value) {
          headers.append(key, Array.isArray(value) ? value.join(", ") : value);
        }
      }

      const url = isProduction
        ? `https://api.instrideapp.com${req.url}`
        : `http://${req.headers.host}${req.url}`;
      const webReq = new Request(url, {
        body: ["GET", "HEAD"].includes(req.method || "") ? undefined : body,
        headers,
        method: req.method,
      });

      // Pass to Better Auth and forward the response
      log.info("calling auth handler", {
        url: webReq.url,
        method: webReq.method,
      });
      const response = await auth.handler(webReq);
      log.info("auth handler response", { status: response.status });

      // Handle set-cookie separately to preserve multiple values
      const setCookieValues = response.headers.getSetCookie?.() ?? [];
      if (setCookieValues.length > 0) {
        res.setHeader("set-cookie", setCookieValues);
      }

      // Forward all other response headers EXCEPT cookies and CORS
      // (Encore manages CORS; overriding would cause duplicates)
      response.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey !== "set-cookie" &&
          !lowerKey.startsWith("access-control-")
        ) {
          res.setHeader(key, value);
        }
      });

      res.writeHead(response.status);

      if (response.body) {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(Buffer.from(value));
        }
        res.end();
      } else {
        res.end();
      }
    } catch (error) {
      log.error("auth handler threw", {
        error: String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      res.writeHead(500);
      res.end();
    }
  }
);

// ===================================================
// Custom endpoints
// ===================================================

interface UpdateUserRequest {
  name?: string | undefined;
  image?: string | null | undefined;
  phone?: string | null | undefined;
  dateOfBirth?: string | null | undefined;
}

export const updateUser = api<UpdateUserRequest, void>(
  { expose: true, method: "POST", path: "/users", auth: true },
  async (request) => {
    const { userID } = requireAuth();

    const [updatedUser] = await db
      .update(authUsers)
      .set(request)
      .where(eq(authUsers.id, userID))
      .returning();

    if (!updatedUser) {
      throw APIError.notFound("User not found");
    }

    return updatedUser;
  }
);

interface GetSessionResponse {
  session: Session | null;
}

interface GetSessionParams {
  sessionToken?: Cookie<"better-auth.session_token">;
  secureSessionToken?: Cookie<"__Secure-better-auth.session_token">;
}

export const getSession = api(
  { expose: true, method: "GET", path: "/session" },
  async (params: GetSessionParams): Promise<GetSessionResponse> => {
    const token =
      params.secureSessionToken?.value ??
      params.sessionToken?.value ??
      undefined;

    if (!token) {
      return { session: null };
    }

    const session = await auth.api.getSession({
      headers: new Headers({
        cookie: buildSessionCookieHeader(token),
      }),
    });

    if (!session) {
      return { session: null };
    }

    return { session };
  }
);
