/**
 * Zod schemas derived from the tables. Routers extend these in their own
 * schemas.ts; forms on web and native import them through @instride/api.
 */
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/zod";
import type { z } from "zod";

import { users } from "./schema/auth";
import { invitations, members, organizations } from "./schema/organizations";
import { levels, riders, trainers } from "./schema/profiles";

export const UserSchema = createSelectSchema(users);
export type User = z.infer<typeof UserSchema>;

export const OrganizationSchema = createSelectSchema(organizations);
export type Organization = z.infer<typeof OrganizationSchema>;
export const OrganizationInsertSchema = createInsertSchema(organizations);
export const OrganizationUpdateSchema = createUpdateSchema(organizations);

export const MemberSchema = createSelectSchema(members);
export type Member = z.infer<typeof MemberSchema>;

export const InvitationSchema = createSelectSchema(invitations);
export type Invitation = z.infer<typeof InvitationSchema>;

export const LevelSchema = createSelectSchema(levels);
export type Level = z.infer<typeof LevelSchema>;

export const TrainerSchema = createSelectSchema(trainers);
export type Trainer = z.infer<typeof TrainerSchema>;

export const RiderSchema = createSelectSchema(riders);
export type Rider = z.infer<typeof RiderSchema>;
