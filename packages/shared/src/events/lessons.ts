export interface LessonInstanceCreatedEvent {
  instanceId: string;
  seriesId: string;
  organizationId: string;
  trainerId: string;
  trainerMemberId: string;
  trainerName: string;
  boardId: string;
  serviceId: string;
  levelId: string | null;
  startTime: string;
  endTime: string;
  maxRiders: number;
  name: string | null;
  isRecurring: boolean;
}

export interface RiderEnrolledInInstanceEvent {
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
}
