export const modelNames = {
  user: "authUsers",
  account: "authAccounts",
  session: "authSessions",
  verification: "authVerifications",
  organization: "authOrganizations",
  invitation: "authInvitations",
  member: "authMembers",
} as const;

export const userAdditionalFields = {
  phone: { type: "string", required: false },
  profilePictureUrl: { type: "string", required: false },
  dateOfBirth: { type: "string", required: false },
  imageKey: { type: "string", required: false },
} as const;

export const organizationAdditionalFields = {
  slug: { type: "string", required: true, unique: true },
  timezone: { type: "string", required: true },
} as const;
