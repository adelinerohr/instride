import type {
  CreateKioskSessionRequest,
  GetKioskSessionResponse,
  ListKioskSessionsResponse,
  UpdateKioskSessionRequest,
  UpsertKioskSessionResponse,
} from "@instride/api/contracts";
import { KioskScope } from "@instride/shared";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { kioskRepo } from "./kiosk.repo";
import { toKioskSession, toKioskSessionListItem } from "./mappers";

export const createKioskSession = api(
  { method: "POST", path: "/kiosk/sessions", expose: true, auth: true },
  async (
    request: CreateKioskSessionRequest
  ): Promise<UpsertKioskSessionResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const session = await kioskRepo.create({
      organizationId,
      boardId: request.boardId ?? null,
      locationName: request.locationName,
      scope: KioskScope.DEFAULT,
    });

    return {
      session: {
        id: session.id,
        locationName: session.locationName,
        boardId: session.boardId,
      },
    };
  }
);

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

    const session = await kioskRepo.update(request.sessionId, organizationId, {
      locationName: request.locationName,
      boardId: request.boardId ?? null,
    });

    return {
      session: {
        id: session.id,
        locationName: session.locationName,
        boardId: session.boardId,
      },
    };
  }
);

export const listKioskSessions = api(
  { method: "GET", path: "/kiosk/sessions", expose: true, auth: true },
  async (): Promise<ListKioskSessionsResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const rows = await kioskRepo.findMany(organizationId);

    return { sessions: rows.map(toKioskSessionListItem) };
  }
);

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

    const session = await kioskRepo.findOne(sessionId, organizationId);

    // Auto-clear expired acting state. Do the side-effect via the service
    // (no HTTP call) and return the cleared state to the caller.
    const isExpired =
      session.expiresAt && new Date(session.expiresAt) < new Date();

    if (isExpired && session.actingMemberId) {
      await kioskRepo.clearActing(sessionId, organizationId);

      return {
        session: toKioskSession({
          ...session,
          actingMemberId: null,
          scope: KioskScope.DEFAULT,
          expiresAt: null,
        }),
        acting: {
          actingMemberId: null,
          scope: KioskScope.DEFAULT,
          expiresAt: null,
        },
      };
    }

    return {
      session: toKioskSession(session),
      acting: {
        actingMemberId: session.actingMemberId,
        scope: session.scope,
        expiresAt: session.expiresAt
          ? session.expiresAt instanceof Date
            ? session.expiresAt.toISOString()
            : session.expiresAt
          : null,
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
    await kioskRepo.delete(sessionId, organizationId);
  }
);
