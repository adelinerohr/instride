import { and, eq, isNotNull } from "drizzle-orm";

import { Database, Transaction } from "@/shared/utils/schema";
import { assertExists } from "@/shared/utils/validation";

import { db } from "../db";
import { serviceExpansion } from "../fragments";
import {
  NewServiceBoardAssignmentRow,
  NewServiceRow,
  NewServiceTrainerAssignmentRow,
  ServiceBoardAssignmentRow,
  serviceBoardAssignments,
  ServiceRow,
  services,
  ServiceTrainerAssignmentRow,
  serviceTrainerAssignments,
} from "../schema";

export const createServiceService = (client: Database | Transaction = db) => ({
  // ============================================================================
  // Services
  // ============================================================================
  create: async (data: NewServiceRow) => {
    const [service] = await client.insert(services).values(data).returning();
    assertExists(service, "Failed to create service");
    return service;
  },

  findOne: async (id: string, organizationId: string) => {
    const service = await db.query.services.findFirst({
      where: { id, organizationId },
      with: serviceExpansion,
    });
    assertExists(service, "Service not found");
    return service;
  },

  findMany: async (
    organizationId: string,
    filters?: { boardId?: string; trainerId?: string }
  ) => {
    const boardCondition = filters?.boardId
      ? { boardAssignments: { boardId: filters.boardId } }
      : {};

    const trainerCondition = filters?.trainerId
      ? { trainerAssignments: { trainerId: filters.trainerId } }
      : {};

    const services = await client.query.services.findMany({
      where: { organizationId, ...boardCondition, ...trainerCondition },
      with: serviceExpansion,
    });
    return services;
  },

  update: async (
    id: string,
    organizationId: string,
    data: Partial<ServiceRow>
  ) => {
    const [service] = await client
      .update(services)
      .set(data)
      .where(
        and(eq(services.id, id), eq(services.organizationId, organizationId))
      )
      .returning();
    assertExists(service, "Failed to update service");
    return service;
  },

  // ============================================================================
  // Trainer assignments
  // ============================================================================

  createTrainerAssignment: async (data: NewServiceTrainerAssignmentRow) => {
    const [assignment] = await client
      .insert(serviceTrainerAssignments)
      .values(data)
      .returning();
    assertExists(assignment, "Failed to create trainer assignment");
    return assignment;
  },

  bulkCreateTrainerAssignments: async (
    data: NewServiceTrainerAssignmentRow[]
  ) => {
    const assignments = await client
      .insert(serviceTrainerAssignments)
      .values(data)
      .returning();
    assertExists(assignments, "Failed to create trainer assignments");
    return assignments;
  },

  findOneTrainerAssignment: async (id: string, organizationId: string) => {
    const assignment = await client.query.serviceTrainerAssignments.findFirst({
      where: { id, organizationId },
    });
    assertExists(assignment, "Trainer assignment not found");
    return assignment;
  },

  findManyTrainerAssignments: async (
    organizationId: string,
    filters?: { serviceId?: string; trainerId?: string }
  ) => {
    const serviceCondition = filters?.serviceId
      ? { serviceId: filters.serviceId }
      : {};

    const trainerCondition = filters?.trainerId
      ? { trainerId: filters.trainerId }
      : {};

    const assignments = await client.query.serviceTrainerAssignments.findMany({
      where: { organizationId, ...serviceCondition, ...trainerCondition },
    });
    return assignments;
  },

  updateTrainerAssignment: async (
    id: string,
    data: Partial<ServiceTrainerAssignmentRow>
  ) => {
    const [assignment] = await client
      .update(serviceTrainerAssignments)
      .set(data)
      .where(eq(serviceTrainerAssignments.id, id))
      .returning();
    assertExists(assignment, "Failed to update trainer assignment");
    return assignment;
  },

  deleteTrainerAssignmentById: async (
    assignmentId: string,
    organizationId: string
  ) => {
    const result = await client
      .delete(serviceTrainerAssignments)
      .where(
        and(
          eq(serviceTrainerAssignments.id, assignmentId),
          eq(serviceTrainerAssignments.organizationId, organizationId)
        )
      );
    assertExists(result, "Failed to delete trainer assignment");
    return result;
  },

  deleteTrainerAssignmentByType: async (
    organizationId: string,
    type: "trainer" | "service"
  ) => {
    const result = await client
      .delete(serviceTrainerAssignments)
      .where(
        and(
          eq(serviceTrainerAssignments.organizationId, organizationId),
          isNotNull(
            type === "trainer"
              ? serviceTrainerAssignments.trainerId
              : serviceTrainerAssignments.serviceId
          )
        )
      );
    assertExists(result, "Failed to delete trainer assignment");
    return result;
  },

  // ============================================================================
  // Board assignments
  // ============================================================================

  createBoardAssignment: async (data: NewServiceBoardAssignmentRow) => {
    const [assignment] = await client
      .insert(serviceBoardAssignments)
      .values(data)
      .returning();
    assertExists(assignment, "Failed to create board assignment");
    return assignment;
  },

  bulkCreateBoardAssignments: async (data: NewServiceBoardAssignmentRow[]) => {
    const assignments = await client
      .insert(serviceBoardAssignments)
      .values(data)
      .returning();
    assertExists(assignments, "Failed to create board assignments");
    return assignments;
  },

  findOneBoardAssignment: async (id: string, organizationId: string) => {
    const assignment = await client.query.serviceBoardAssignments.findFirst({
      where: { id, organizationId },
    });
    assertExists(assignment, "Board assignment not found");
    return assignment;
  },

  findManyBoardAssignments: async (
    organizationId: string,
    filters?: { serviceId?: string; boardId?: string }
  ) => {
    const serviceCondition = filters?.serviceId
      ? { serviceId: filters.serviceId }
      : {};

    const boardCondition = filters?.boardId ? { boardId: filters.boardId } : {};

    const assignments = await client.query.serviceBoardAssignments.findMany({
      where: { organizationId, ...serviceCondition, ...boardCondition },
    });
    return assignments;
  },

  updateBoardAssignment: async (
    id: string,
    data: Partial<ServiceBoardAssignmentRow>
  ) => {
    const [assignment] = await client
      .update(serviceBoardAssignments)
      .set(data)
      .where(eq(serviceBoardAssignments.id, id))
      .returning();
    assertExists(assignment, "Failed to update board assignment");
    return assignment;
  },

  deleteBoardAssignmentById: async (
    assignmentId: string,
    organizationId: string
  ) => {
    const result = await client
      .delete(serviceBoardAssignments)
      .where(
        and(
          eq(serviceBoardAssignments.id, assignmentId),
          eq(serviceBoardAssignments.organizationId, organizationId)
        )
      );
    assertExists(result, "Failed to delete board assignment");
    return result;
  },

  deleteBoardAssignmentByType: async (
    organizationId: string,
    type: "board" | "service"
  ) => {
    const result = await client
      .delete(serviceBoardAssignments)
      .where(
        and(
          eq(serviceBoardAssignments.organizationId, organizationId),
          isNotNull(
            type === "board"
              ? serviceBoardAssignments.boardId
              : serviceBoardAssignments.serviceId
          )
        )
      );
    assertExists(result, "Failed to delete board assignment");
    return result;
  },
});

export const serviceService = createServiceService();
