import type {
  ListInstanceEnrollmentsResponse,
  ListMyEnrollmentsRequest,
  ListMyEnrollmentsResponse,
  ListRiderEnrollmentsResponse,
  ListSeriesEnrollmentsResponse,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";
import { guardians, organizations } from "~encore/clients";

import { requireOrganizationAuth } from "@/shared/auth";

import {
  toInstanceEnrollment,
  toInstanceEnrollmentWithInstance,
} from "../mappers";
import {
  instanceEnrollmentRepo,
  seriesEnrollmentRepo,
} from "./enrollment.repo";

export const listSeriesEnrollments = api(
  {
    expose: true,
    method: "GET",
    path: "/lessons/series/:id/enrollments",
    auth: true,
  },
  async ({ id }: { id: string }): Promise<ListSeriesEnrollmentsResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const enrollments = await seriesEnrollmentRepo.findMany(id, organizationId);

    return { enrollments };
  }
);

export const listInstanceEnrollments = api(
  {
    expose: true,
    method: "GET",
    path: "/lessons/instances/:id/enrollments",
    auth: true,
  },
  async ({ id }: { id: string }): Promise<ListInstanceEnrollmentsResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const enrollments = await instanceEnrollmentRepo.findManyByInstance({
      instanceId: id,
      organizationId,
    });

    return { enrollments: enrollments.map(toInstanceEnrollment) };
  }
);

export const listRiderEnrollments = api(
  {
    expose: true,
    method: "GET",
    path: "/lessons/instances/enrollments/rider/:riderId",
    auth: true,
  },
  async ({
    riderId,
  }: {
    riderId: string;
  }): Promise<ListRiderEnrollmentsResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const enrollments = await instanceEnrollmentRepo.findManyForRiders({
      riderIds: [riderId],
      organizationId,
    });

    return { enrollments: enrollments.map(toInstanceEnrollmentWithInstance) };
  }
);

/**
 * The current user's enrollments — including any dependents they manage as
 * a guardian. Used for the "my upcoming lessons" view.
 */
export const listMyEnrollments = api(
  {
    expose: true,
    method: "GET",
    path: "/lessons/instances/enrollments/me",
    auth: true,
  },
  async ({
    from,
    to,
  }: ListMyEnrollmentsRequest): Promise<ListMyEnrollmentsResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const { relationships } = await guardians.listMyDependents();
    const dependentRiderIds = relationships.map((r) => r.rider.id);

    const ownRiderId = member.rider?.id;
    const riderIds = [
      ...new Set(
        ownRiderId !== undefined
          ? [ownRiderId, ...dependentRiderIds]
          : dependentRiderIds
      ),
    ];

    if (riderIds.length === 0) {
      return { enrollments: [] };
    }

    const enrollments = await instanceEnrollmentRepo.findManyForRiders({
      organizationId,
      riderIds,
      range: { from: new Date(from), to: new Date(to) },
    });

    return {
      enrollments: enrollments.map(toInstanceEnrollmentWithInstance),
    };
  }
);
