import { Member } from "@/services/organizations/types/models";

export enum ActivityType {
  // Rider-specific
  ENROLLMENT_CREATED = "enrollment_created",
  LESSON_COMPLETED = "lesson_completed_as_rider",
  WAIVER_SIGNED = "waiver_signed",
  QUESTIONNAIRE_SUBMITTED = "questionnaire_submitted",
  LEVEL_UPDATED = "level_updated",

  // Trainer-specific
  LESSON_TAUGHT = "lesson_taught",
  STUDENT_ASSIGNED = "student_assigned",

  // Role-neutral (posts, comments, etc.)
  POST_CREATED = "post_created",
  COMMENT_ADDED = "comment_added",
  PROFILE_UPDATED = "profile_updated",
  CREDIT_PACKAGE_PURCHASED = "credit_package_purchased",
  INVOICE_PAID = "invoice_paid",
  USER_UPDATED = "user_updated",
}

export enum ActivitySubjectType {
  LESSON = "lesson",
  POST = "post",
  PAYMENT = "payment",
  RIDER = "rider",
  TRAINER = "trainer",
  OTHER = "other",
}

export interface ActivityMetadata {
  // Lesson activities
  lessonId?: string;
  instanceId?: string;
  trainerName?: string;
  trainerProfileId?: string;
  trainerMemberId?: string;
  riderName?: string;
  riderProfileId?: string;
  riderMemberId?: string;
  horseName?: string;
  horses?: Array<{
    id: string;
    name: string;
  }>;
  riders?: Array<{
    name: string;
    profileId?: string;
    memberId?: string;
  }>;
  otherRiders?: Array<{
    name: string;
  }>;
  lessonName?: string;
  startTime?: string;
  endTime?: string;
  completedAt?: string;
  duration?: string;

  // Post/social activities
  postId?: string;
  content?: string;
  truncatedContent?: string;
  commentCount?: number;

  // Questionnaire/Waiver activities
  questionnaireId?: string;
  questionnaireName?: string;
  waiverType?: string;

  // Generic fields
  title?: string;
  description?: string;
  reason?: string;
  notes?: string;
}

export interface Activity {
  id: string;
  createdAt: Date | string;
  metadata: ActivityMetadata;
  organizationId: string;
  actorMemberId: string | null;
  ownerMemberId: string;
  trainerId: string | null;
  riderId: string | null;
  subjectType: ActivitySubjectType;
  subjectId: string;
  type: ActivityType;
  actorMember?: Member | null;
}
