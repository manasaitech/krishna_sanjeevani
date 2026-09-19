export type AppMode = "surawali" | "emotion_remediation";

export interface Env {
  // Bindings
  DB: D1Database;
  SONG_BUCKET: R2Bucket;
  EMOTION_SONGS_BUCKET?: R2Bucket;
  CACHE: KVNamespace;
  MEDIA_QUEUE: Queue;

  // Secrets & Configs
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  ENVIRONMENT: "development" | "production" | "staging";
  PAYMENT_MODE?: "mock" | "razorpay";
  GOOGLE_CLIENT_ID?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  HOSTINGER_MAIL_TOKEN?: string;
  HOSTINGER_MAILBOX_ID?: string;

  // ── Mode Configuration ──
  /** Active application mode. Determines content, payment credentials, and business logic. */
  APP_MODE?: AppMode;

  // ── Mode-specific Payment Credentials ──
  // Payment secrets remain backend-only — never exposed to the frontend.
  SURAWALI_PAYMENT_KEY?: string;
  SURAWALI_PAYMENT_SECRET?: string;
  EMOTION_PAYMENT_KEY?: string;
  EMOTION_PAYMENT_SECRET?: string;
}
