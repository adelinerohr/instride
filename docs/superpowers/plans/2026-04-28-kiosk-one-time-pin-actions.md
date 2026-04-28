# Kiosk One-Time PIN Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In kiosk DEFAULT mode, restricted actions prompt “Select yourself” (PIN), perform exactly one action, then return to DEFAULT; when already acting, actions run without a PIN prompt and are gated by kiosk permissions.

**Architecture:** Add a small “one-time authorized action” runner in the kiosk feature layer that can (a) run actions directly when acting, or (b) open `ActAsModal`, run the requested action, and then clear kiosk identity in a `finally`. Update calendar slot click and lesson view roster/footer to use the runner and show “Action not allowed” UI on permission denials.

**Tech Stack:** React + TanStack Router/Query, existing kiosk APIs (`useVerifyKioskIdentity`, `useClearKioskIdentity`, `useKioskEnrollInInstance`, `useKioskUnenrollFromInstance`), existing modal handlers (`DialogHandler`, `SheetHandler`).

---

## File structure / touchpoints

**Modify**

- `apps/web/src/features/kiosk/components/act-as-modal.tsx`: expose a way to prefill selected member and to notify “verify succeeded” to a caller (one-time runner).
- `apps/web/src/features/kiosk/hooks/use-kiosk.tsx`: (optional) expose helpers to identify DEFAULT vs acting; keep as-is if not needed.
- `apps/web/src/features/calendar/components/views/fragments/hour-cell.tsx`: route calendar slot click through one-time runner and show “not allowed” instead of silent return.
- `apps/web/src/features/lessons/components/modals/view-lesson/index.tsx`: add kiosk enroll button in footer (kiosk-only).
- `apps/web/src/features/lessons/components/modals/view-lesson/riders-list.tsx`: remove check-in toggle UI; add rider row dropdown with Unenroll (kiosk-only).

**Create**

- `apps/web/src/features/kiosk/hooks/use-one-time-kiosk-auth-action.ts`: encapsulate verify → run action → clear flow with error handling and “not allowed” dialog triggering.
- `apps/web/src/features/kiosk/components/not-allowed-dialog.tsx` (or reuse existing confirmation/alert component if present): consistent UI for permission denied.

**Verify**

- `apps/web/src/features/kiosk/lib/permissions.ts` & related usage: ensure kioskPermissions are used only for acting sessions (not for DEFAULT-gated flow).

---

### Task 1: Add “not allowed” dialog helper

**Files:**

- Create: `apps/web/src/features/kiosk/components/not-allowed-dialog.tsx`
- Modify: (if needed) `apps/web/src/features/kiosk/components/header.tsx` or root kiosk route to mount dialog

- [ ] **Step 1: Locate existing alert/confirmation patterns**
  - Search for a generic “alert dialog handler” usage (similar to `confirmationModalHandler`) and prefer reusing it if it supports title + description.

- [ ] **Step 2: Implement `notAllowedDialogHandler`**
  - If no reusable handler exists, implement a simple `DialogHandler`-backed component:

```tsx
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHandler,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

export const notAllowedDialogHandler = DialogHandler.createHandle<{
  title?: string;
  description?: string;
}>();

export function NotAllowedDialog() {
  return (
    <Dialog handle={notAllowedDialogHandler}>
      {({ payload }) =>
        payload ? (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{payload.title ?? "Action not allowed"}</DialogTitle>
              <DialogDescription>
                {payload.description ??
                  "You are not allowed to perform this action."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => notAllowedDialogHandler.close()}>
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null
      }
    </Dialog>
  );
}
```

- [ ] **Step 3: Mount the dialog once in kiosk shell**
  - Add `<NotAllowedDialog />` near `ActAsModal` in `apps/web/src/routes/org/$slug/(authenticated)/kiosk/$sessionId/route.tsx` so it is available anywhere in kiosk routes.

- [ ] **Step 4: Format/lint**
  - Run: `pnpm dlx ultracite fix`

---

### Task 2: Make `ActAsModal` support “prefill” + “continue” (one-time flow)

**Files:**

- Modify: `apps/web/src/features/kiosk/components/act-as-modal.tsx`

- [ ] **Step 1: Add payload type for prefill + onSuccess**
  - Update `actAsModalHandler` to carry optional payload:

```ts
type ActAsModalPayload = {
  defaultMemberId?: string;
  onSuccess?: (acting: {
    actingMemberId: string;
    scope: "self" | "staff";
  }) => void;
};
```

- [ ] **Step 2: On open, prefill member selection**
  - When payload includes `defaultMemberId`, set initial form `memberId` accordingly.

- [ ] **Step 3: On successful verify, call `onSuccess`**
  - After `startActing(...)` succeeds, call `payload.onSuccess?.({ actingMemberId: value.memberId, scope: derivedScope? })`.
  - Note: if derived scope isn’t available client-side from verify response, just call `onSuccess` with the new kiosk acting state from refetch, or call without scope and let the runner read `useKiosk().acting`.

- [ ] **Step 4: Ensure existing “start acting” UX remains unchanged**
  - `KioskHeader` / banners that open `actAsModalHandler.open(null)` should still work.

- [ ] **Step 5: Format/lint**
  - Run: `pnpm dlx ultracite fix`

---

### Task 3: Create the one-time restricted action runner hook

**Files:**

- Create: `apps/web/src/features/kiosk/hooks/use-one-time-kiosk-auth-action.ts`

- [ ] **Step 1: Implement hook API**

```ts
export function useOneTimeKioskAuthAction() {
  return {
    runRestricted: async (opts: {
      // Used for prefill + better error messaging
      defaultMemberId?: string;
      actionName: string;
      // Called after verify when acting is active
      run: () => Promise<void>;
    }) => Promise<void>;
  };
}
```

- [ ] **Step 2: Behavior**
  - If `useKiosk().acting.scope !== DEFAULT`: `await opts.run()` and catch permission errors to show not-allowed dialog.
  - If DEFAULT:
    - Open `ActAsModal` with payload `{ defaultMemberId, onSuccess }`
    - In `onSuccess`, `await opts.run()` then `await stopActing()` (clear identity) in a `finally`
    - Also clear identity if the action fails/denies.
  - Ensure the promise returned from `runRestricted` resolves/rejects correctly (no dangling).

- [ ] **Step 3: Permission denied mapping**
  - When backend returns permission denied, open `notAllowedDialogHandler` with message from error when appropriate.

- [ ] **Step 4: Format/lint**
  - Run: `pnpm dlx ultracite fix`

---

### Task 4: Kiosk calendar slot click uses one-time runner

**Files:**

- Modify: `apps/web/src/features/calendar/components/views/fragments/hour-cell.tsx`

- [ ] **Step 1: Fix inverted “actAs modal opens when already acting” logic**
  - It should open only when `kioskSession.scope === DEFAULT` (or derived from acting state if available).

- [ ] **Step 2: Replace silent permission return with “not allowed”**
  - When the action is denied (either by local `kioskPermissions` or by backend), show not-allowed dialog.

- [ ] **Step 3: Branch create surface by derived scope**
  - For `STAFF`: call `createLesson(payload)` (admin modal path).
  - For `SELF`: navigate to `/org/$slug/portal/lessons/create` and pass search params (`date`, `boardId`, `trainerId`) if supported.

- [ ] **Step 4: Ensure action is one-time when DEFAULT**
  - Use `runRestricted({ actionName: "Create lesson", run: async () => createLesson(...) })`
  - Ensure it clears identity afterwards (runner responsibility).

- [ ] **Step 5: Format/lint**
  - Run: `pnpm dlx ultracite fix`

---

### Task 5: View lesson roster: remove check-in toggle, add Unenroll dropdown (kiosk)

**Files:**

- Modify: `apps/web/src/features/lessons/components/modals/view-lesson/riders-list.tsx`

- [ ] **Step 1: Remove “check-in” header + toggle column**
  - Delete `Switch` usage and check-in label UI.

- [ ] **Step 2: Add dropdown menu per rider row with Unenroll**
  - Use existing dropdown menu primitives already imported elsewhere (`DropdownMenu*`).
  - Wire Unenroll action:
    - If kiosk acting: call kiosk unenroll mutation directly.
    - If DEFAULT: use one-time runner to verify → unenroll → clear.
  - Only show this menu in kiosk context (not portal, not admin global view if not intended).

- [ ] **Step 3: On success**
  - Close the view lesson sheet (call `onClose` passed down or use handler) and show toast “Unenrolled successfully” (match existing patterns).

- [ ] **Step 4: Format/lint**
  - Run: `pnpm dlx ultracite fix`

---

### Task 6: View lesson footer: add Enroll button (kiosk)

**Files:**

- Modify: `apps/web/src/features/lessons/components/modals/view-lesson/index.tsx`

- [ ] **Step 1: Determine kiosk context inside view lesson modal**
  - Use `useRouteContext({ strict: false })` to detect kiosk route context presence (e.g. `kioskSession` exists).

- [ ] **Step 2: Render Enroll button when kiosk**
  - Button triggers kiosk enroll mutation with `instanceId`, `sessionId`, and `riderMemberId` derived from acting identity selection.
  - If acting is DEFAULT, wrap with one-time runner.
  - If denied, show not-allowed dialog.

- [ ] **Step 3: Format/lint**
  - Run: `pnpm dlx ultracite fix`

---

## Verification

- Run: `pnpm dlx ultracite check`
- Manual smoke:
  - Kiosk DEFAULT → click calendar slot → must ask “Select yourself”, then create lesson, then immediately returns to DEFAULT (banner/acting indicator).
  - Kiosk DEFAULT → open lesson → Unenroll action → asks “Select yourself”, unenrolls, returns to DEFAULT.
  - Kiosk DEFAULT → open lesson → Enroll → asks “Select yourself”, enrolls, returns to DEFAULT.
  - Kiosk acting SELF/STAFF → repeat above actions, no PIN prompt.
