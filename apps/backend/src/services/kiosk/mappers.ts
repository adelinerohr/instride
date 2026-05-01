import type {
  KioskSession,
  KioskSessionListItem,
} from "@instride/api/contracts";
import { KioskScope } from "@instride/shared";

import type { BoardRow } from "@/services/boards/schema";
import { toISO, toISOOrNull } from "@/shared/utils/mappers";

import type { KioskSessionRow } from "./schema";

type KioskSessionWithBoard = KioskSessionRow & {
  board: BoardRow | null;
};

export function toKioskSession(row: KioskSessionWithBoard): KioskSession {
  return {
    id: row.id,
    organizationId: row.organizationId,
    boardId: row.boardId,
    boardName: row.board?.name ?? null,
    locationName: row.locationName,
    actingMemberId: row.actingMemberId,
    scope: row.scope,
    expiresAt: toISOOrNull(row.expiresAt),
    createdAt: toISO(row.createdAt),
  };
}

export function toKioskSessionListItem(
  row: KioskSessionWithBoard
): KioskSessionListItem {
  return {
    id: row.id,
    locationName: row.locationName,
    boardId: row.boardId,
    boardName: row.board?.name ?? null,
    actingMemberId: row.actingMemberId,
    scope: row.scope,
    currentlyActing:
      row.actingMemberId !== null && row.scope !== KioskScope.DEFAULT,
  };
}
