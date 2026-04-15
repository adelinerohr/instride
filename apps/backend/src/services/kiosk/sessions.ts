import { and, eq } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";

import { db } from "@/database";
import { requireOrganizationAuth } from "@/shared/auth";

import { clearKioskIdentity } from "./identity";
import { kioskSessions } from "./schema";
import { KioskScope, KioskSession } from "./types/models";

interface CreateKioskSessionRequest {
  boardId?: string | null;
  locationName: string;
}

interface UpsertKioskSessionResponse {
  session: {
    id: string;
    locationName: string;
    boardId: string | null;
  };
}

export const createKioskSession = api(
  {
    method: "POST",
    path: "/kiosk/sessions",
    expose: true,
    auth: true,
  },
  async (
    request: CreateKioskSessionRequest
  ): Promise<UpsertKioskSessionResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const [session] = await db
      .insert(kioskSessions)
      .values({
        organizationId,
        boardId: request.boardId,
        locationName: request.locationName,
        scope: KioskScope.DEFAULT,
      })
      .returning();

    return {
      session: {
        id: session.id,
        locationName: session.locationName,
        boardId: session.boardId,
      },
    };
  }
);

interface UpdateKioskSessionRequest {
  sessionId: string;
  locationName: string;
  boardId?: string | null;
}

export const updateKioskSession = api(
  {
    method: "PUT",
    path: "/kiosk/sessions/:sessionId",
    expose: true,
    auth: true,
  },
  async (
    request: UpdateKioskSessionRequest
  ): Promise<UpsertKioskSessionResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const [session] = await db
      .update(kioskSessions)
      .set({
        locationName: request.locationName,
        boardId: request.boardId,
      })
      .where(
        and(
          eq(kioskSessions.id, request.sessionId),
          eq(kioskSessions.organizationId, organizationId)
        )
      )
      .returning();

    return {
      session: {
        id: session.id,
        locationName: session.locationName,
        boardId: session.boardId,
      },
    };
  }
);

interface ListKioskSessionsResponse {
  sessions: {
    id: string;
    locationName: string;
    boardId: string | null;
    boardName: string | null;
    currentlyActing: boolean;
    actingMemberId: string | null;
    scope: KioskScope;
  }[];
}

export const listKioskSessions = api(
  {
    method: "GET",
    path: "/kiosk/sessions",
    expose: true,
    auth: true,
  },
  async (): Promise<ListKioskSessionsResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const sessions = await db.query.kioskSessions.findMany({
      where: {
        organizationId,
      },
      with: {
        board: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      sessions: sessions.map((session) => ({
        id: session.id,
        locationName: session.locationName,
        boardId: session.boardId,
        boardName: session.board?.name ?? null,
        currentlyActing:
          session.actingMemberId !== null &&
          session.scope !== KioskScope.DEFAULT,
        actingMemberId: session.actingMemberId,
        scope: session.scope,
      })),
    };
  }
);

interface GetKioskSessionResponse {
  session: KioskSession;
  acting: {
    actingMemberId: string | null;
    scope: KioskScope;
    expiresAt: string | null;
  };
}

export const getKioskSession = api(
  {
    method: "GET",
    path: "/kiosk/session/:sessionId",
    expose: true,
    auth: true,
  },
  async ({
    sessionId,
  }: {
    sessionId: string;
  }): Promise<GetKioskSessionResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const session = await db.query.kioskSessions.findFirst({
      where: {
        id: sessionId,
        organizationId,
      },
    });

    if (!session) {
      throw APIError.notFound("Session not found");
    }

    // Check if acting state has expired
    const isExpired =
      session.expiresAt && new Date(session.expiresAt) < new Date();

    if (isExpired && session.actingMemberId) {
      await clearKioskIdentity({ sessionId });

      return {
        session,
        acting: {
          actingMemberId: null,
          scope: KioskScope.DEFAULT,
          expiresAt: null,
        },
      };
    }

    return {
      session,
      acting: {
        actingMemberId: session.actingMemberId,
        scope: session.scope,
        expiresAt: session.expiresAt?.toISOString() ?? null,
      },
    };
  }
);

export const deleteKioskSession = api(
  {
    method: "DELETE",
    path: "/kiosk/sessions/:sessionId",
    expose: true,
    auth: true,
  },
  async ({ sessionId }: { sessionId: string }): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();

    await db
      .delete(kioskSessions)
      .where(
        and(
          eq(kioskSessions.id, sessionId),
          eq(kioskSessions.organizationId, organizationId)
        )
      );
  }
);
