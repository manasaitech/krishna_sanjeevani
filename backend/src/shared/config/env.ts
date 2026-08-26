export interface Env {
  // Bindings
  DB: D1Database;
  SONG_BUCKET: R2Bucket;
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
}
