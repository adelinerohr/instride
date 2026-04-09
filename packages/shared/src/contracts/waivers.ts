import { Waiver, WaiverSignature } from "../interfaces/waivers";

export interface EditWaiverRequest extends Omit<
  Waiver,
  "id" | "createdAt" | "updatedAt"
> {}

export interface CreateWaiverRequest {
  title: string;
  content: string;
}

export interface CreateWaiverResponse {
  waiver: Waiver;
}

export interface UpdateWaiverRequest extends Partial<CreateWaiverRequest> {}

export interface UpdateWaiverResponse {
  waiver: Waiver;
}

export interface GetWaiverResponse {
  waiver: Waiver;
  signature: WaiverSignature | null;
}

export interface GetWaiversResponse {
  waivers: Waiver[];
}

export interface SignWaiverResponse {
  signature: WaiverSignature;
}

export interface SignBehalfOfResponse {
  signature: WaiverSignature;
}

export interface GetSignaturesResponse {
  signatures: WaiverSignature[];
}

export interface GetSignatureResponse {
  signature: WaiverSignature | null;
}
