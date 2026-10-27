import type {
  KioskActingState,
  KioskActionContext,
  KioskScope,
} from "@instride/shared";

import { CreateLessonSeriesRequest } from "./lessons";
import { Member, Rider } from "./organizations";

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
  expiresAt: string | null;
  createdAt: string;
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

export interface CheckKioskPermissionRequest {
  sessionId: string;
  verification: { memberId: string; pin: string };
  context: KioskActionContext;
}

// Lesson actions

export interface KioskEnrollInInstanceRequest {
  sessionId: string;
  instanceId: string;
  riderMemberId: string;
  verification?: { memberId: string; pin: string };
}

export interface KioskUnenrollFromInstanceRequest {
  sessionId: string;
  enrollmentId: string;
  verification?: { memberId: string; pin: string };
}

export interface KioskCancelLessonInstanceRequest {
  sessionId: string;
  instanceId: string;
  reason: string;
  verification?: { memberId: string; pin: string };
}

export interface KioskMarkAttendanceRequest {
  sessionId: string;
  enrollmentId: string;
  riderMemberId: string;
  attended: boolean;
  verification?: { memberId: string; pin: string };
}

export interface KioskCreateLessonInstanceRequest {
  sessionId: string;
  // Target rider memberId — used for permission resolution and as the
  // automatic enrollee for SELF-scope creations. STAFF can omit auto-enroll
  // (handled inside the mutation).
  riderMemberId: string;
  boardId: string;
  isRecurring: boolean;
  // The full lesson input payload — service, trainer, start, end, etc.
  // Same shape as the existing non-kiosk create endpoint.
  input: CreateLessonSeriesRequest;
  verification?: { memberId: string; pin: string };
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

export interface CheckKioskPermissionResponse {
  member: Member;
  riderOptions: Rider[];
}

export interface GetKioskActingRiderOptionsResponse {
  riderOptions: Rider[];
}
