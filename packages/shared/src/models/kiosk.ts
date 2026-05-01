import { KioskActions, KioskScope } from "./enums";

export type KioskActionContext =
  | { action: typeof KioskActions.ENROLL; targetMemberId: string }
  | { action: typeof KioskActions.UNENROLL; targetMemberId: string }
  | { action: typeof KioskActions.LESSON_CREATE; boardId: string }
  | {
      action: typeof KioskActions.LESSON_CANCEL;
      lessonInstanceId: string;
    }
  | { action: typeof KioskActions.LESSON_EDIT }
  | { action: typeof KioskActions.TIME_BLOCK_CREATE }
  | { action: typeof KioskActions.TIME_BLOCK_EDIT }
  | { action: typeof KioskActions.MARK_ATTENDANCE; targetMemberId: string }
  | { action: typeof KioskActions.LESSON_CHECK_IN; targetMemberId: string };

export interface KioskActingState {
  actingMemberId: string | null;
  scope: KioskScope;
  expiresAt: string | null;
}

export interface KioskActiveActingState {
  actingMemberId: string;
  scope: KioskScope;
  expiresAt: string;
}

export interface KioskActor {
  memberId: string;
  scope: KioskScope;
}
