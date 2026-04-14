import { Waiver, WaiverSignature } from "./models";

export interface ListWaiversResponse {
  waivers: Waiver[];
}

export interface GetWaiverResponse {
  waiver: Waiver;
}

export interface ListSignaturesResponse {
  signatures: WaiverSignature[];
}

export interface GetSignatureResponse {
  signature: WaiverSignature;
}
