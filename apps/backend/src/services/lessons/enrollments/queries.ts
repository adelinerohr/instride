import type {
  ListInstanceEnrollmentsResponse,
  ListMyEnrollmentsRequest,
  ListMyEnrollmentsResponse,
  ListSeriesEnrollmentsResponse,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";
import { guardians, organizations } from "~encore/clients";

import { requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import {
  toInstanceEnrollment,
  toInstanceEnrollmentWithInstance,
} from "../mappers";
import {
  instanceEnrollmentService,
  seriesEnrollmentService,
} from "./enrollment.service";

export const listSeriesEnrollments = api(
  {
    expose: true,
    method: "GET",
    path: "/lessons/series/:id/enrollments",
    auth: true,
  },
  async ({ id }: { id: string }): Promise<ListSeriesEnrollmentsResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const enrollments = await seriesEnrollmentService.findMany(
      id,
      organizationId
    );

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

    const enrollments = await instanceEnrollmentService.findManyByInstance({
      instanceId: id,
      organizationId,
    });

    return { enrollments: enrollments.map(toInstanceEnrollment) };
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
    assertExists(member.rider, "Current member is not a rider");

    const { relationships } = await guardians.getMyDependents();
    const dependentRiderIds = relationships.map((r) => r.dependent.riderId);

    const riderIds = [member.rider.id, ...dependentRiderIds];

    const enrollments = await instanceEnrollmentService.findManyForRiders({
      organizationId,
      riderIds,
      range: { from: new Date(from), to: new Date(to) },
    });

    return {
      enrollments: enrollments.map(toInstanceEnrollmentWithInstance),
    };
  }
);
