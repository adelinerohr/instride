import { KioskScope } from "./models";

export interface KioskSessionResponse {
  acting: {
    actingMemberId: string | null;
    scope: KioskScope;
    expiresAt: string | null;
  };
}
