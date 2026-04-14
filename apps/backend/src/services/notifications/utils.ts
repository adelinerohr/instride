import { NotificationChannel, NotificationPreference } from "./types/models";

export function getEnabledChannels(preferences: NotificationPreference) {
  const channels: NotificationChannel[] = [NotificationChannel.IN_APP]; // Always include

  if (preferences.pushEnabled) channels.push(NotificationChannel.PUSH);
  if (preferences.emailEnabled) channels.push(NotificationChannel.EMAIL);
  if (preferences.smsEnabled) channels.push(NotificationChannel.SMS);

  return channels;
}
