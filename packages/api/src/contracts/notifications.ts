import type { NotificationChannel, NotificationType } from "@instride/shared";

// ============================================================================
// Entities
// ============================================================================

export interface Notification {
  id: string;
  organizationId: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType: string;
  entityId: string | null;
  deepLink: string | null;
  isRead: boolean;
  readAt: Date | string | null;
  createdAt: Date | string;
}

export interface NotificationPreference {
  id: string;
  organizationId: string;
  memberId: string;
  type: NotificationType;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ============================================================================
// Requests
// ============================================================================

export interface CreateNotificationRequest {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType: string;
  entityId?: string | null;
  deepLink?: string | null;
  channels?: NotificationChannel[];
}

export interface UpdatePreferencesRequest {
  memberId: string;
  preferences: Array<{
    type: NotificationType;
    inAppEnabled: boolean;
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
  }>;
}

// ============================================================================
// Responses
// ============================================================================

export interface GetNotificationResponse {
  notification: Notification;
}

export interface GetUnreadResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface GetPreferenceResponse {
  preference: NotificationPreference | null;
}

export interface ListPreferencesResponse {
  preferences: NotificationPreference[];
}

export interface UpdatePreferencesResponse {
  preferences: NotificationPreference[];
}
