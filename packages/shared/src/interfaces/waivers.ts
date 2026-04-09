import { WaiverStatus } from "../models/enums";

export interface Waiver {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
  status: WaiverStatus;
  version: string;
  title: string;
  content: string;
}

export interface WaiverSignature {
  id: string;
  organizationId: string;
  ipAddress: string | null;
  waiverId: string;
  waiverVersion: string;
  signerMemberId: string;
  onBehalfOfMemberId: string | null;
  signedAt: Date;
  isValid: boolean;
  invalidatedAt: Date | null;
  invalidatedReason: string | null;
}

export interface WaiverWithSignature extends Waiver {
  signature: WaiverSignature | null;
}
