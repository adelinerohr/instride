# Org invitation accepted → email inviter

## Goal

When a user accepts an organization invitation, send an email to the **original inviter** indicating the invitation was accepted.

## Non-goals

- Notifying all admins (only the `inviterId`).
- In-app notifications (email only).
- Sending an email for rejected/cancelled/expired invitations.

## Current context

Org invitations are created and emailed in `apps/backend/src/services/organizations/invitations/mutations.ts` (`sendInvitation`) and accepted in the same file (`acceptInvitation`). Invitation acceptance updates membership rows and sets the invitation status to `ACCEPTED` inside a DB transaction.

Email sending is already done asynchronously via `sendEmailTopic` (`@/services/email/topic`) with templates under `apps/backend/src/services/email/templates`.

## Design

### Trigger point

After the invitation acceptance transaction successfully commits in `acceptInvitation`, publish an email send request (or an “invitation accepted” event that results in a send request) so the acceptance endpoint stays simple.

**Constraint:** publishing must occur **after** the transaction commits to avoid sending for rolled-back accept attempts.

### Data required

To email the inviter we need:

- `inviterId` (source of truth: invitation row)
- `invitee` (accepting user): name + email
- `organization`: name + slug (to build a deep link)
- `invitation`: id + roles (optional to include in email)

### Message flow

1. `POST /invitations/:id/accept` validates and updates DB (existing behavior).
2. After the transaction succeeds, the handler loads:
   - inviter user record (`inviterId`)
   - organization (by `invitation.organizationId` / `authOrganizationId` lookup used elsewhere)
3. The handler publishes a message that results in an email to the inviter.

### Email content

- **To**: inviter email
- **Subject**: `"<InviteeName> accepted your invitation to join <OrgName>"`
- **Body**:
  - Invitee name + email
  - Organization name
  - Roles granted (if present)
  - Link: org members page (`/org/:slug/settings/organization/members`) or another admin-relevant destination

### Idempotency / duplicates

Pub/Sub delivery is at-least-once and the accept endpoint may be retried. We should avoid duplicate sends.

Preferred approach:

- Make the publish conditional on the invitation transition `PENDING -> ACCEPTED` (already enforced), and
- Add a lightweight dedupe keyed by `invitationId` for the “accepted email sent” effect (implementation to follow existing patterns if a general email dedupe exists; otherwise add a small persistence flag).

## Error handling

- If inviter lookup fails (deleted user), skip sending and log.
- If inviter has no email, skip sending and log.
- If email send fails, rely on topic retry behavior.

## Testing

- Unit/integration test for `acceptInvitation` that:
  - accepts a pending invitation
  - verifies exactly one message is published for the inviter
  - verifies no publish happens when invitation is not pending / wrong email / expired
