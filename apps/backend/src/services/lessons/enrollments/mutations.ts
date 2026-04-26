import {
  EnrollInInstanceResponse,
  EnrollInSeriesResponse,
  EnrollRidersInInstanceRequest,
  EnrollRidersInSeriesRequest,
  SeriesEnrollmentFailure,
  UnenrollFromInstanceRequest,
  UnenrollRiderFromSeriesRequest,
} from "@instride/api/contracts";
import {
  LessonInstanceStatus,
  LessonSeriesEnrollmentStatus,
  LessonSeriesStatus,
} from "@instride/shared";
import { api, APIError } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { memberService } from "@/services/organizations/members/member.service";
import { requireOrganizationAuth } from "@/shared/auth";

import { lessonInstanceService } from "../instances/instance.service";
import { publishRiderEnrolled } from "../instances/publish";
import { toInstanceEnrollment } from "../mappers";
import { lessonSeriesService } from "../series/series.service";
import {
  instanceEnrollmentService,
  seriesEnrollmentService,
} from "./enrollment.service";

// ------------------------------------------------------------
// Instance Enrollments
// ------------------------------------------------------------

/**
 * Internal: enroll a list of riders into an instance.
 * Used by HTTP endpoint and scheduler. Idempotent flag controls error behavior.
 */
export async function enrollRidersInInstance(input: {
  organizationId: string;
  instanceId: string;
  riderIds: string[];
  enrolledByMemberId: string | null;
  idempotent?: boolean;
}) {
  if (input.riderIds.length === 0) return [];

  const instance = await lessonInstanceService.findOne(
    input.instanceId,
    input.organizationId
  );

  if (instance.status === LessonInstanceStatus.CANCELLED) {
    throw APIError.failedPrecondition("Lesson instance is cancelled");
  }

  const results = await Promise.all(
    input.riderIds.map((riderId) =>
      instanceEnrollmentService.enroll({
        instanceId: instance.id,
        riderId,
        enrolledByMemberId: input.enrolledByMemberId,
        idempotent: input.idempotent ?? true,
      })
    )
  );

  // Publish events for newly created enrollments only
  const created = results.filter((r) => r.wasCreated);
  for (const result of created) {
    const rider = await memberService.findOneRider(
      result.enrollment.riderId,
      input.organizationId
    );
    const trainer = await memberService.findOneTrainer(
      result.instance.trainerId,
      input.organizationId
    );

    if (rider?.member?.authUser && trainer?.member?.authUser) {
      await publishRiderEnrolled({
        instanceId: result.instance.id,
        seriesId: result.instance.seriesId,
        organizationId: result.instance.organizationId,
        riderId: result.enrollment.riderId,
        riderMemberId: rider.memberId,
        riderName: rider.member.authUser.name,
        enrolledByMemberId: input.enrolledByMemberId ?? "",
        trainerId: result.instance.trainerId,
        trainerMemberId: trainer.memberId,
        trainerName: trainer.member.authUser.name,
        startTime: result.instance.start.toISOString(),
        endTime: result.instance.end.toISOString(),
        lessonName: result.instance.name,
      });
    }
  }

  return results.map((r) => r.enrollment);
}

export const enrollInInstance = api(
  {
    expose: true,
    method: "POST",
    path: "/lessons/instances/:instanceId/enroll",
    auth: true,
  },
  async (
    request: EnrollRidersInInstanceRequest
  ): Promise<EnrollInInstanceResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    // HTTP path: non-idempotent so user sees "Already enrolled" errors
    const enrollments = await enrollRidersInInstance({
      organizationId,
      instanceId: request.instanceId,
      riderIds: request.riderIds,
      enrolledByMemberId: request.enrolledByMemberId ?? member.id,
      idempotent: false,
    });

    // Re-fetch with rider relations for the response
    const fullEnrollments = await Promise.all(
      enrollments.map(async (e) => {
        const full = await instanceEnrollmentService.findOne(
          e.id,
          organizationId
        );
        return toInstanceEnrollment(full);
      })
    );

    return { enrollments: fullEnrollments };
  }
);

export const unenrollFromInstance = api(
  {
    expose: true,
    method: "POST",
    path: "/lessons/instances/enrollments/:enrollmentId/unenroll",
    auth: true,
  },
  async (request: UnenrollFromInstanceRequest): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    await instanceEnrollmentService.unenroll({
      enrollmentId: request.enrollmentId,
      organizationId,
      unenrolledByMemberId: member.id,
    });
  }
);

// ------------------------------------------------------------
// Series Enrollments
// ------------------------------------------------------------

export const enrollInSeries = api(
  {
    expose: true,
    method: "POST",
    path: "/lessons/series/:seriesId/enroll",
    auth: true,
  },
  async (
    request: EnrollRidersInSeriesRequest
  ): Promise<EnrollInSeriesResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const series = await lessonSeriesService.findOneScalar(
      request.seriesId,
      organizationId
    );

    if (series.status !== LessonSeriesStatus.ACTIVE) {
      throw APIError.failedPrecondition("Series is not active");
    }

    if (request.riderIds.length === 0) {
      return { enrolled: [], failed: [] };
    }

    const results = await Promise.allSettled(
      request.riderIds.map((riderId) =>
        seriesEnrollmentService
          .upsert({
            organizationId,
            seriesId: request.seriesId,
            riderId,
            enrolledByMemberId: member.id,
            startDate: request.startDate,
            endDate: request.endDate,
          })
          .then((enrollment) => ({ riderId, enrollment }))
      )
    );

    const succeededIds: string[] = [];
    const failed: SeriesEnrollmentFailure[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const riderId = request.riderIds[i];

      if (result.status === "fulfilled") {
        succeededIds.push(result.value.enrollment.id);
      } else {
        failed.push({
          riderId,
          reason:
            result.reason instanceof APIError || result.reason instanceof Error
              ? result.reason.message
              : "Unknown error",
        });
      }
    }

    // Re-fetch the successful enrollments with the rider relation so the
    // response shape matches the contract.
    const enrolled =
      succeededIds.length > 0
        ? await seriesEnrollmentService.findMany(
            request.seriesId,
            organizationId,
            { succeededIds }
          )
        : [];

    return { enrolled, failed };
  }
);

export const unenrollRiderFromSeries = api(
  {
    expose: true,
    method: "POST",
    path: "/lessons/series/:seriesId/unenroll",
    auth: true,
  },
  async (request: UnenrollRiderFromSeriesRequest): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const enrollment = await seriesEnrollmentService.findOne(
      request.seriesId,
      organizationId,
      request.riderId
    );

    if (enrollment.status === LessonSeriesEnrollmentStatus.CANCELLED) {
      throw APIError.failedPrecondition(
        "Rider is already unenrolled from this series"
      );
    }

    await seriesEnrollmentService.cancel({
      seriesId: request.seriesId,
      riderId: request.riderId,
      organizationId,
      endedByMemberId: member.id,
    });
  }
);
