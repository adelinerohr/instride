import type { ActivitySubjectType, ActivityType } from "@instride/shared";

import type { MemberSummary } from "./organizations";

// ============================================================================
// Activity metadata
// ============================================================================
//
// Single flexible bag with all possible fields optional. The frontend
// renders different activity types with different metadata fields; the
// shape can grow without a contract migration.

export interface ActivityMetadata {
  // Lesson activities
  lessonId?: string;
  instanceId?: string;
  seriesId?: string;
  trainerName?: string;
  trainerProfileId?: string;
  trainerMemberId?: string;
  riderName?: string;
  riderProfileId?: string;
  riderMemberId?: string;
  horseName?: string;
  horses?: Array<{ id: string; name: string }>;
  riders?: Array<{ name: string; profileId?: string; memberId?: string }>;
  otherRiders?: Array<{ name: string }>;
  lessonName?: string;
  startTime?: string;
  endTime?: string;
  completedAt?: string;
  duration?: string;

  // Post/social
  postId?: string;
  content?: string;
  truncatedContent?: string;
  commentCount?: number;

  // Questionnaire/Waiver
  questionnaireId?: string;
  questionnaireName?: string;
  waiverType?: string;

  // Generic
  title?: string;
  description?: string;
  reason?: string;
  notes?: string;
}

// ============================================================================
// Entities
// ============================================================================

export interface Activity {
  id: string;
  organizationId: string;
  actorMemberId: string | null;
  ownerMemberId: string;
  trainerId: string | null;
  riderId: string | null;
  subjectType: ActivitySubjectType;
  subjectId: string;
  type: ActivityType;
  metadata: ActivityMetadata;
  createdAt: Date | string;
  actorMember: MemberSummary | null;
}

// ============================================================================
// Requests + responses
// ============================================================================

import type { MembershipRole } from "@instride/shared";

export interface CreateActivityRequest {
  ownerMemberId: string;
  subjectType: ActivitySubjectType;
  subjectId: string;
  type: ActivityType;
  metadata: ActivityMetadata;
  actorMemberId?: string | null;
  actorRole?: MembershipRole;
}

export interface ListActivityRequest {
  ownerMemberId: string;
  riderId?: string;
  trainerId?: string;
}

export interface GetActivityResponse {
  activity: Activity;
}

export interface ListActivityResponse {
  activities: Activity[];
}
