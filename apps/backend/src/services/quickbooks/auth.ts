import { eq } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";

import { db } from "@/database";
import { requireOrganizationAuth } from "@/shared/auth";

import {
  quickbooksClientId,
  quickbooksClientSecret,
  quickbooksRedirectUri,
} from "./encore.service";
import { quickbooksConnections } from "./schema";

interface ConnectQuickBooksResponse {
  authUrl: string;
}

export const getQuickbooksAuthUrl = api(
  {
    method: "GET",
    path: "/quickbooks/auth-url",
    expose: true,
    auth: true,
  },
  async (): Promise<ConnectQuickBooksResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const scopes = [
      "com.intuit.quickbooks.accounting",
      "com.intuit.quickbooks.payment",
    ].join(" ");

    const state = Buffer.from(JSON.stringify({ organizationId })).toString(
      "base64"
    );

    const authUrl = new URL("https://appcenter.intuit.com/connect/oauth2");
    authUrl.searchParams.set("client_id", quickbooksClientId());
    authUrl.searchParams.set("redirect_uri", quickbooksRedirectUri());
    authUrl.searchParams.set("scope", scopes);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("state", state);

    return { authUrl: authUrl.toString() };
  }
);

interface QuickBooksCallbackRequest {
  code: string;
  state: string;
  realmId: string;
}

interface QuickBooksTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  x_refresh_token_expires_in: number;
  token_type: string;
}

export const handleQuickBooksCallback = api(
  { expose: true, method: "GET", path: "/quickbooks/callback", auth: false },
  async (request: QuickBooksCallbackRequest): Promise<{ success: boolean }> => {
    const { organizationId } = JSON.parse(
      Buffer.from(request.state, "base64").toString()
    );

    const auth = Buffer.from(
      `${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(
      "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: request.code,
          redirect_uri: quickbooksRedirectUri(),
        }),
      }
    );

    if (!response.ok) {
      throw APIError.unavailable(
        "Failed to exchange QuickBooks authorization code"
      );
    }

    const data = (await response.json()) as QuickBooksTokenResponse;

    const now = new Date();
    const accessTokenExpiresAt = new Date(
      now.getTime() + data.expires_in * 1000
    );
    const refreshTokenExpiresAt = new Date(
      now.getTime() + data.x_refresh_token_expires_in * 1000
    );

    const connection = {
      id: `qb_${Date.now()}`,
      organizationId,
      realmId: request.realmId,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(quickbooksConnections).values(connection);

    return { success: true };
  }
);

export const refreshAccessToken = api(
  {
    method: "POST",
    path: "/quickbooks/refresh-access-token",
    auth: true,
  },
  async () => {
    const { organizationId } = requireOrganizationAuth();

    const connection = await db.query.quickbooksConnections.findFirst({
      where: {
        organizationId,
        isActive: true,
      },
    });

    if (!connection) {
      throw APIError.notFound(
        "No QuickBooks connection found for this facility"
      );
    }

    // Check if token needs refresh (refresh if expires in < 10 minutes)
    const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);
    if (connection.accessTokenExpiresAt > tenMinutesFromNow) {
      return connection.accessToken;
    }

    const auth = Buffer.from(
      `${quickbooksClientId()}:${quickbooksClientSecret()}`
    ).toString("base64");

    const response = await fetch(
      "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: connection.refreshToken,
        }),
      }
    );

    if (!response.ok) {
      throw APIError.unavailable("Failed to refresh QuickBooks access token");
    }

    const data = (await response.json()) as QuickBooksTokenResponse;

    const now = new Date();
    await db
      .update(quickbooksConnections)
      .set({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        accessTokenExpiresAt: new Date(now.getTime() + data.expires_in * 1000),
        refreshTokenExpiresAt: new Date(
          now.getTime() + data.x_refresh_token_expires_in * 1000
        ),
        updatedAt: now,
      })
      .where(eq(quickbooksConnections.id, connection.id));

    return data.access_token;
  }
);

export const getConnection = api(
  {
    method: "GET",
    path: "/quickbooks/connection",
    auth: true,
    expose: true,
  },
  async () => {
    const { organizationId } = requireOrganizationAuth();

    const connection = await db.query.quickbooksConnections.findFirst({
      where: {
        organizationId,
        isActive: true,
      },
    });

    return connection;
  }
);

export const disconnectQuickBooks = api(
  {
    method: "DELETE",
    path: "/quickbooks/connection",
    auth: true,
    expose: true,
  },
  async () => {
    const { organizationId } = requireOrganizationAuth();

    await db
      .update(quickbooksConnections)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(quickbooksConnections.organizationId, organizationId));
  }
);
