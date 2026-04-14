import { Notification, NotificationPreference } from "./models";

export interface GetPreferencesResponse {
  preferences: NotificationPreference;
}

export interface GetNotificationResponse {
  notification: Notification;
}
