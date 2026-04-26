import { WaiverStatus } from "@instride/shared";

// ============================================================================
// Entities
// ============================================================================

export interface Waiver {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizationId: string;
  title: string;
  content: string;
  version: string;
  status: WaiverStatus;
}

export interface WaiverSignature {
  id: string;
  organizationId: string;
  waiverId: string;
  waiverVersion: string;
  signerMemberId: string;
  onBehalfOfMemberId: string | null;
  signedAt: Date | string;
  ipAddress: string | null;
  isValid: boolean;
  invalidatedAt: Date | string | null;
  invalidatedReason: string | null;
}

export interface WaiverWithSignatures extends Waiver {
  signatures: WaiverSignature[];
}

// ============================================================================
// Requests + Responses
// ============================================================================

export interface CreateWaiverRequest {
  title: string;
  content: string;
  status?: WaiverStatus;
  version?: string;
}

export interface UpdateWaiverRequest extends Partial<CreateWaiverRequest> {
  id: string;
}

export interface ListWaiversResponse {
  waivers: Waiver[];
}

export interface GetWaiverResponse {
  waiver: Waiver;
}

export interface ListSignaturesRequest {
  id: string;
  signerMemberId?: string;
}

export interface ListSignaturesResponse {
  signatures: WaiverSignature[];
}

export interface GetSignatureResponse {
  signature: WaiverSignature;
}

export interface SignWaiverRequest {
  id: string;
  onBehalfOfMemberId?: string | null;
}
