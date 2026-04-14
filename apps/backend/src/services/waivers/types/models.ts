import { WaiverStatus } from "@instride/shared";

export interface Waiver {
  organizationId: string;
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  status: WaiverStatus;
  version: string;
  title: string;
  content: string;
  signature?: WaiverSignature | null;
}

export interface WaiverSignature {
  organizationId: string;
  id: string;
  signerMemberId: string;
  waiverId: string;
  onBehalfOfMemberId: string | null;
  ipAddress: string | null;
  waiverVersion: string;
  signedAt: Date | string;
  isValid: boolean;
  invalidatedAt: Date | string | null;
  invalidatedReason: string | null;
}
