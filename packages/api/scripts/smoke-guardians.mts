/**
 * End-to-end check of the guardianship flows against a running server with an
 * EMPTY database (it creates fixed emails). Usage:
 *   API_URL=http://localhost:4000 npx tsx scripts/smoke-guardians.mts
 */
import { createApiClient } from "../src/client.ts";

const base = process.env.API_URL ?? "http://localhost:4000";
const H = {
  "content-type": "application/json",
  origin: "http://localhost:3000",
};

async function signUp(email: string, name: string) {
  const res = await fetch(`${base}/auth/sign-up/email`, {
    method: "POST",
    headers: H,
    body: JSON.stringify({ email, password: "password123", name }),
  });
  if (!res.ok)
    throw new Error(`sign up ${email}: ${res.status} ${await res.text()}`);
  const cookie = res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  return () => ({ cookie });
}

let failures = 0;
function check(label: string, ok: boolean, detail = "") {
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  (${detail})` : ""}`
  );
}
async function expectError(
  label: string,
  code: string,
  fn: () => Promise<unknown>
) {
  try {
    await fn();
    check(label, false, "no error thrown");
  } catch (e: any) {
    check(label, e.code === code, `${e.code}: ${e.message}`);
  }
}

// --- setup: admin, org, parent (no roles), unrelated rider
const admin = await signUp("admin@g.test", "Admin");
const org = (
  await createApiClient({ baseUrl: base, headers: admin }).organizations.create(
    {
      name: "Guardian Barn",
      slug: "guardian-barn",
      timezone: "America/New_York",
    }
  )
).organization;
const asAdmin = createApiClient({
  baseUrl: base,
  organizationId: org.id,
  headers: admin,
});

const mom = await signUp("mom@g.test", "Mom");
const momInvite = await asAdmin.invitations.create({
  email: "mom@g.test",
  roles: [],
});
await createApiClient({ baseUrl: base, headers: mom }).invitations.accept({
  token: momInvite.token,
});
const asMom = createApiClient({
  baseUrl: base,
  organizationId: org.id,
  headers: mom,
});

const rita = await signUp("rita@g.test", "Rita");
await createApiClient({ baseUrl: base, headers: rita }).invitations.accept({
  token: (
    await asAdmin.invitations.create({ email: "rita@g.test", roles: ["rider"] })
  ).token,
});
const asRita = createApiClient({
  baseUrl: base,
  organizationId: org.id,
  headers: rita,
});

const momMe = await asMom.members.me();
check(
  "parent joins with no roles",
  momMe.roles.length === 0,
  JSON.stringify(momMe.roles)
);

// --- create a dependent without a login
await expectError("consent is required", "BAD_REQUEST", () =>
  asMom.guardians.createDependent({
    name: "Lily",
    consent: false as unknown as true,
  })
);
const { dependent: lily } = await asMom.guardians.createDependent({
  name: "Lily",
  dateOfBirth: "2015-04-02",
  consent: true,
  permissions: { bookings: { requiresApproval: false } },
});
check("dependent has no login", lily.userId === null);

const mine = await asMom.guardians.myDependents();
check("myDependents lists Lily", mine.length === 1 && mine[0]!.name === "Lily");
check("Lily got a rider profile", mine[0]!.rider !== null);
check(
  "permission patch applied, rest default",
  mine[0]!.permissions.bookings.requiresApproval === false &&
    mine[0]!.permissions.bookings.canCancel === true
);

const momMe2 = await asMom.members.me();
check(
  "mom isGuardian via relationships, not a role",
  momMe2.isGuardian && momMe2.roles.length === 0
);

// --- forbidden for unrelated members
await expectError("rider can't change Lily's permissions", "FORBIDDEN", () =>
  asRita.guardians.updatePermissions({
    dependentMemberId: lily.id,
    permissions: { profile: { canEdit: false } },
  })
);
await expectError("rider can't view Lily's guardians", "FORBIDDEN", () =>
  asRita.guardians.guardiansOf({ dependentMemberId: lily.id })
);
await expectError(
  "non-admin can't create dependent for someone else",
  "FORBIDDEN",
  () =>
    asRita.guardians.createDependent({
      name: "X",
      consent: true,
      guardianMemberId: momMe.id,
    })
);

// --- admin can manage, staff can view
const adminPerms = await asAdmin.guardians.updatePermissions({
  dependentMemberId: lily.id,
  permissions: { communication: { canPost: false } },
});
check(
  "admin can update permissions; earlier patch kept",
  adminPerms.communication.canPost === false &&
    adminPerms.bookings.requiresApproval === false
);

// --- last guardian guard
const momLink = mine[0]!.relationshipId;
await expectError("can't revoke Lily's only guardian", "BAD_REQUEST", () =>
  asMom.guardians.revoke({ relationshipId: momLink })
);
await expectError(
  "admin can't remove mom while she's Lily's only guardian",
  "BAD_REQUEST",
  () => asAdmin.members.remove({ memberId: momMe.id })
);

// --- co-guardian invite
const dad = await signUp("dad@g.test", "Dad");
const dadInvite = await asMom.guardians.inviteGuardian({
  dependentMemberId: lily.id,
  email: "dad@g.test",
});
const preview = await createApiClient({ baseUrl: base }).invitations.byToken({
  token: dadInvite.token,
});
check(
  "invite preview names the dependent",
  preview.kind === "guardian_link" && preview.dependent?.name === "Lily"
);
await createApiClient({ baseUrl: base, headers: dad }).invitations.accept({
  token: dadInvite.token,
});
const asDad = createApiClient({
  baseUrl: base,
  organizationId: org.id,
  headers: dad,
});
const dadDeps = await asDad.guardians.myDependents();
check(
  "dad joined org and sees Lily",
  dadDeps.length === 1 && dadDeps[0]!.memberId === lily.id
);
check(
  "dad sees the SAME permissions mom set",
  dadDeps[0]!.permissions.communication.canPost === false &&
    dadDeps[0]!.permissions.bookings.requiresApproval === false
);

const guardians = await asDad.guardians.guardiansOf({
  dependentMemberId: lily.id,
});
check(
  "Lily has two guardians",
  guardians.length === 2,
  guardians.map((g) => g.name).join(", ")
);

await asMom.guardians.revoke({ relationshipId: momLink });
check(
  "mom can step back now that dad is linked",
  (await asMom.guardians.myDependents()).length === 0
);
await expectError("dad is now the last guardian", "BAD_REQUEST", () =>
  asDad.guardians.revoke({ relationshipId: dadDeps[0]!.relationshipId })
);

// --- dependent gets her own login
await expectError(
  "mom (no longer guardian) can't invite Lily's login",
  "FORBIDDEN",
  () =>
    asMom.guardians.inviteDependentLogin({
      dependentMemberId: lily.id,
      email: "lily@g.test",
    })
);
const lilyInvite = await asDad.guardians.inviteDependentLogin({
  dependentMemberId: lily.id,
  email: "lily@g.test",
});
const lilyAuth = await signUp("lily@g.test", "Lily R");
await expectError("someone else can't accept Lily's invite", "FORBIDDEN", () =>
  createApiClient({ baseUrl: base, headers: rita }).invitations.accept({
    token: lilyInvite.token,
  })
);
await createApiClient({ baseUrl: base, headers: lilyAuth }).invitations.accept({
  token: lilyInvite.token,
});
const asLily = createApiClient({
  baseUrl: base,
  organizationId: org.id,
  headers: lilyAuth,
});
const lilyMe = await asLily.members.me();
check("Lily's login attached to the SAME member row", lilyMe.id === lily.id);
check(
  "Lily is still a dependent with dad's restrictions",
  lilyMe.isDependent && lilyMe.restrictions?.communication.canPost === false
);
check(
  "Lily's dateOfBirth moved to her account",
  lilyMe.user?.dateOfBirth === "2015-04-02"
);
check(
  "Lily's display name now comes from her account",
  lilyMe.displayName === "Lily R"
);
await expectError("Lily can't change her own permissions", "FORBIDDEN", () =>
  asLily.guardians.updatePermissions({
    dependentMemberId: lily.id,
    permissions: { communication: { canPost: true } },
  })
);
await expectError(
  "dependent-login invite can't be used twice",
  "NOT_FOUND",
  () =>
    createApiClient({ baseUrl: base, headers: lilyAuth }).invitations.accept({
      token: lilyInvite.token,
    })
);

// --- members.list shows everyone sensibly
const list = await asAdmin.members.list();
const lilyRow = list.find((m) => m.id === lily.id)!;
check(
  "admin list: Lily has login and is a dependent",
  lilyRow.hasLogin && lilyRow.isDependent
);

console.log(failures === 0 ? "\nALL PASSED" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
