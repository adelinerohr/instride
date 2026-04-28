## Context

The kiosk has a persistent “acting identity” stored server-side per kiosk session:

- `DEFAULT`: no acting identity selected
- `SELF`: acting identity is a rider (non-admin/non-trainer)
- `STAFF`: acting identity is admin/trainer

Today, selecting yourself is done via the existing `ActAsModal` (member selector + 4-digit PIN) which calls `POST /kiosk/verify` and sets `actingMemberId`, `scope`, and `expiresAt` on the kiosk session.

## Goal

Change kiosk behavior so that when the kiosk is in `DEFAULT` scope and the user triggers a restricted action, the kiosk:

- Prompts “Select yourself” (PIN)
- Performs **only that single action**
- Returns to `DEFAULT` scope immediately afterward

Kiosk should still support explicitly “Start acting” for users who want to do a series of actions without repeated PIN prompts.

## Non-goals

- Do not add new backend endpoints or contracts for one-time PIN authorization.
- Do not redesign portal lesson create UI (it is currently a page; it will become a modal later).
- Do not change kiosk session creation/setup flows.

## Definitions

### Restricted actions (this change)

- **Create lesson** (calendar timeslot click)
- **Enroll** (lesson view footer button)
- **Unenroll** (rider row dropdown in lesson view roster)

### One-time authorization

“One-time authorization” is implemented by temporarily using the existing kiosk acting identity as a credential:

1. Verify identity (`/kiosk/verify`) to set acting scope.
2. Execute exactly one restricted action.
3. Clear identity (`/kiosk/clear`) so the kiosk returns to `DEFAULT`.

The **end-user experience** is that the scope doesn’t stay changed after a restricted action.

## UX requirements

### When already acting (not DEFAULT)

- The kiosk does **not** prompt for PIN.
- Restricted actions run immediately and are allowed/denied based on the current acting scope and backend enforcement.
- Errors should show a clear “Action not allowed” message when permission/business rules deny the operation.

### When in DEFAULT

For any restricted action:

- Show “Select yourself” (existing `ActAsModal`).
- After successful PIN verification, perform the action.
- Regardless of success/denial, clear kiosk identity so the session returns to `DEFAULT`.
- The user should not be able to chain multiple actions “for free” between verify and clear.

## UI changes (web)

### Calendar slot click (kiosk)

Location: calendar hour cell click handling (kiosk type).

New behavior:

- If kiosk acting scope is `DEFAULT`, clicking a timeslot triggers one-time authorization for **Create lesson**.
- After verification, route to the correct creation surface based on derived scope:
  - `STAFF` → open admin/trainer create-lesson modal (existing `lessonModalHandler` via `createLesson(...)`).
  - `SELF` → open portal create-lesson flow (navigate to `/org/$slug/portal/lessons/create` with appropriate prefilled search params if supported).
- If the action is denied by backend rules, show “Action not allowed”.
- Clear kiosk identity immediately after the action attempt completes.

### View lesson roster (kiosk)

Location: `ViewLessonModal` roster list (`RidersList`).

New behavior:

- Remove the check-in toggle UI entirely.
- Each enrolled rider row shows a menu dropdown (ellipsis) with **Unenroll** only.
- Clicking Unenroll is a restricted action:
  - If acting: run immediately.
  - If DEFAULT: run one-time authorization (verify → unenroll → clear).
  - If denied: show “Action not allowed”.

### View lesson footer (kiosk)

Location: `ViewLessonModal` footer actions.

New behavior:

- Add an **Enroll** button for kiosk usage.
- Clicking Enroll is a restricted action:
  - If acting: run immediately.
  - If DEFAULT: run one-time authorization (verify → enroll → clear).
  - If denied: show “Action not allowed”.

## Authorization + error handling

### Backend source of truth

Backend already enforces:

- No active acting identity → `permission_denied` (“No active kiosk session” / expired)
- `SELF` acting may only act for self, and some actions are staff-only.
- Booking/enrollment rules can deny enroll with `permission_denied` and a reason.

Frontend should treat `permission_denied` for restricted actions as “Action not allowed” and show a dialog/alert (not silent fail).

### “Not allowed” UI

Use a consistent modal/alert for restricted action denial with:

- Title: “Action not allowed”
- Description: backend message when safe/user-friendly; otherwise a generic fallback.

## Implementation notes

### One-time action runner

Create a small helper in the kiosk feature layer that supports:

- If acting is already active: run action directly.
- If acting is DEFAULT:
  - Open `ActAsModal` and await verification.
  - Run the requested action.
  - Clear acting identity.

Important: `ActAsModal` currently immediately sets acting and closes. The helper needs a way to:

- Pre-register a “pending restricted action”
- Resume it after verify succeeds
- Ensure clear runs even on failure (finally block semantics)

### Guardrails against multi-action chaining

While a one-time restricted action is in progress:

- Disable other restricted action triggers (at minimum within the modal that started it).
- Always clear identity after the action attempt completes.

## Acceptance criteria

- Calendar timeslot click in kiosk DEFAULT:
  - prompts “Select yourself”
  - creates lesson using staff modal if staff, portal flow if self
  - returns to DEFAULT after the attempt
  - shows “Action not allowed” on denial
- Lesson roster:
  - no check-in toggle
  - rider row menu has Unenroll only
  - Unenroll prompts “Select yourself” if DEFAULT and then returns to DEFAULT afterward
  - denial shows “Action not allowed”
- Lesson footer:
  - shows Enroll button
  - Enroll prompts “Select yourself” if DEFAULT and returns to DEFAULT afterward
  - denial shows “Action not allowed”
