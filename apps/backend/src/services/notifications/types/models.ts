export enum NotificationType {
  ENROLLMENT_CREATED = "enrollment_created",
  LESSON_ENROLLED = "lesson_enrolled",
  LESSON_CANCELLED = "lesson_cancelled",
  LESSON_REMINDER = "lesson_reminder",
  POST_CREATED = "post_created",
  COMMENT_ADDED = "comment_added",
  PROFILE_UPDATED = "profile_updated",
  CREDIT_PACKAGE_PURCHASED = "credit_package_purchased",
  INVOICE_PAID = "invoice_paid",
  USER_UPDATED = "user_updated",
}

export enum NotificationChannel {
  EMAIL = "email",
  SMS = "sms",
  PUSH = "push",
  IN_APP = "in_app",
}

export interface Notification {
  id: string;
  createdAt: Date | string;
  organizationId: string;
  title: string;
  recipientId: string;
  type: NotificationType;
  message: string;
  entityType: string;
  entityId: string | null;
  deepLink: string | null;
  isRead: boolean;
  readAt: Date | string | null;
}

export interface NotificationPreference {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizationId: string;
  memberId: string;
  type: NotificationType;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
}
