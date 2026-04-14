import { isAPIError } from "better-auth/api";
import { api, APIError } from "encore.dev/api";

import { requireAuth } from "@/shared/auth";

import { auth } from "./auth";
import { Session } from "./handler";

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

    // handle set-cookie separately to avoid deduplication
    const setCookieValues = response.headers.getSetCookie?.() ?? [];
    if (setCookieValues.length > 0) {
      res.setHeader("set-cookie", setCookieValues);
    }

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "set-cookie") {
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
}

export const updateUser = api<UpdateUserRequest, void>(
  { expose: true, method: "POST", path: "/users", auth: true },
  async (request) => {
    try {
      const { status } = await auth.api.updateUser({
        body: request,
      });
      if (status) return;
    } catch (error) {
      if (isAPIError(error)) {
        throw APIError.internal(error.message, error);
      }
    }
  }
);

interface GetSessionResponse {
  session: Session;
}

export const getSession = api<void, GetSessionResponse>(
  { expose: true, method: "GET", path: "/session", auth: true },
  async () => {
    const { session } = requireAuth();
    return { session };
  }
);
