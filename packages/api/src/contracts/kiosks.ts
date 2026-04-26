import type { KioskScope } from "@instride/shared";

// ============================================================================
// Entities
// ============================================================================

export interface KioskSession {
  id: string;
  organizationId: string;
  boardId: string | null;
  boardName: string | null;
  locationName: string;
  actingMemberId: string | null;
  scope: KioskScope;
  expiresAt: Date | string | null;
  createdAt: Date | string;
}

export interface KioskActingState {
  actingMemberId: string | null;
  scope: KioskScope;
  expiresAt: string | null;
}

export interface KioskSessionListItem {
  id: string;
  locationName: string;
  boardId: string | null;
  boardName: string | null;
  currentlyActing: boolean;
  actingMemberId: string | null;
  scope: KioskScope;
}

// ============================================================================
// Requests
// ============================================================================

export interface CreateKioskSessionRequest {
  locationName: string;
  boardId?: string | null;
}

export interface UpdateKioskSessionRequest {
  sessionId: string;
  locationName: string;
  boardId?: string | null;
}

export interface VerifyKioskIdentityRequest {
  sessionId: string;
  memberId: string;
  pin: string;
}

export interface ClearKioskIdentityRequest {
  sessionId: string;
}

// Lesson actions

export interface KioskEnrollInInstanceRequest {
  sessionId: string;
  instanceId: string;
  riderMemberId: string;
}

export interface KioskUnenrollFromInstanceRequest {
  sessionId: string;
  enrollmentId: string;
}

export interface KioskMarkAttendanceRequest {
  sessionId: string;
  enrollmentId: string;
  attended: boolean;
}

// ============================================================================
// Responses
// ============================================================================

export interface KioskSessionResponse {
  acting: KioskActingState;
}

export interface UpsertKioskSessionResponse {
  session: {
    id: string;
    locationName: string;
    boardId: string | null;
  };
}

export interface ListKioskSessionsResponse {
  sessions: KioskSessionListItem[];
}

export interface GetKioskSessionResponse {
  session: KioskSession;
  acting: KioskActingState;
}
