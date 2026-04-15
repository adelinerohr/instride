import { z } from "zod";

import { WaiverStatus } from "../models/enums";

// --- Base Schema ------------------------------------------------------------

export const waiverSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  title: z.string(),
  content: z.string(),
  version: z.string(),
  status: z.enum(WaiverStatus),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const waiverSignatureSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  waiverId: z.string(),
  waiverVersion: z.string(),
  signerMemberId: z.string(),
  onBehalfOfMemberId: z.string().nullable(),
  signedAt: z.coerce.date().nullable(),
  ipAddress: z.string().nullable(),
  isValid: z.boolean(),
  invalidatedAt: z.coerce.date().nullable(),
  invalidatedReason: z.string().nullable(),
});

// --- Contract Schemas ------------------------------------------------------------

export const signWaiverInputSchema = waiverSignatureSchema.pick({
  signerMemberId: true,
  onBehalfOfMemberId: true,
  waiverId: true,
});

export const waiverInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export const updateWaiverRequestSchema = waiverSchema.omit({
  id: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
});

export const updateWaiverResponseSchema = z.object({
  waiver: waiverSchema,
});

export const getWaiverResponseSchema = z.object({
  waiver: waiverSchema,
  signature: waiverSignatureSchema.nullable(),
});

export const getWaiversResponseSchema = z.object({
  waivers: z.array(waiverSchema),
});

export const signWaiverResponseSchema = z.object({
  signature: waiverSignatureSchema,
});

export const signBehalfOfResponseSchema = z.object({
  signature: waiverSignatureSchema,
});

export const getSignaturesResponseSchema = z.object({
  signatures: z.array(waiverSignatureSchema),
});
