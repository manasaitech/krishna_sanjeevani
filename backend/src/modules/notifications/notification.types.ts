export const NOTIFICATION_TYPES = {
  WELCOME: "welcome",
  FIRST_SURAWALI_CTA: "first_surawali_cta",
  SURAWALI_SUBSCRIPTION: "surawali_subscription",
  SURAWALI_REMINDER: "surawali_reminder",
  SYSTEM: "system",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
