import { eq } from "drizzle-orm";
import { appMeta } from "encore.dev";
import { api, APIError, Cookie } from "encore.dev/api";

import { db } from "@/database";
import { requireAuth } from "@/shared/auth";

import { auth } from "./auth";
import { Session } from "./handler";
import { authUsers } from "./schema";

const isProd = appMeta().environment.type === "production";

const allowedOrigins = isProd
  ? [
      "https://instride.vercel.app",
      "https://instrideapp.com",
      "https://app.instrideapp.com",
    ]
  : ["http://localhost:3000", "http://localhost:4000", "http://localhost:5173"];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Cookie, X-Requested-With, X-CSRF-Token",
    "Access-Control-Expose-Headers": "Set-Cookie",
    "Access-Control-Max-Age": "86400",
  };

  // Check if origin is allowed (exact match or Vercel preview deployment)
  if (origin) {
    const isAllowed =
      allowedOrigins.includes(origin) ||
      (origin.endsWith(".vercel.app") && origin.includes("instride")) ||
      origin.endsWith(".instrideapp.com");

    if (isAllowed) {
      headers["Access-Control-Allow-Origin"] = origin;
      headers["Access-Control-Allow-Credentials"] = "true";
    }
  }

  return headers;
}

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
    const origin = req.headers.origin || null;
    const corsHeaders = getCorsHeaders(origin);

    // Handle OPTIONS preflight request
    if (req.method === "OPTIONS") {
      Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      res.writeHead(204);
      res.end();
      return;
    }

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

    const url = `http://${req.headers.host}${req.url}`;
    const webReq = new Request(url, {
      body: ["GET", "HEAD"].includes(req.method || "") ? undefined : body,
      headers,
      method: req.method,
    });

    // Pass to Better Auth and forward the response
    const response = await auth.handler(webReq);

    // Set CORS headers FIRST
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // handle set-cookie separately to avoid deduplication
    const setCookieValues = response.headers.getSetCookie?.() ?? [];
    if (setCookieValues.length > 0) {
      res.setHeader("set-cookie", setCookieValues);
    }

    // Set other response headers (skip set-cookie and CORS headers)
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

    // handle both streaming and non-streaming responses
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
}

export const getSession = api(
  { expose: true, method: "GET", path: "/session" },
  async (params: GetSessionParams): Promise<GetSessionResponse> => {
    if (!params.sessionToken?.value) {
      return { session: null };
    }

    const session = await auth.api.getSession({
      headers: new Headers({
        cookie: `better-auth.session_token=${params.sessionToken.value}`,
      }),
    });

    if (!session) {
      return { session: null };
    }

    return { session };
  }
);
