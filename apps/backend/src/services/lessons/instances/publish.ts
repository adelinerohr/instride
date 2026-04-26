import { lessonCreated, lessonEnrolled } from "../topics";
import { lessonInstanceService } from "./instance.service";

export async function publishLessonCreated(
  instance: Awaited<ReturnType<typeof lessonInstanceService.findOneExpanded>>
): Promise<void> {
  if (!instance) return;

  await lessonCreated.publish({
    instanceId: instance.id,
    seriesId: instance.seriesId,
    organizationId: instance.organizationId,
    trainerId: instance.trainerId,
    trainerMemberId: instance.trainer?.memberId ?? "",
    trainerName: instance.trainer?.member?.authUser?.name ?? "",
    boardId: instance.boardId,
    serviceId: instance.serviceId,
    levelId: instance.levelId ?? null,
    startTime: instance.start.toISOString(),
    endTime: instance.end.toISOString(),
    maxRiders: instance.maxRiders,
    name: instance.name ?? instance.service?.name ?? null,
    isRecurring: instance.series?.isRecurring ?? false,
  });
}

export async function publishRiderEnrolled(input: {
  instanceId: string;
  seriesId: string;
  organizationId: string;
  riderId: string;
  riderMemberId: string;
  riderName: string;
  enrolledByMemberId: string;
  trainerId: string;
  trainerMemberId: string;
  trainerName: string;
  startTime: string;
  endTime: string;
  lessonName: string | null;
}): Promise<void> {
  await lessonEnrolled.publish(input);
}
