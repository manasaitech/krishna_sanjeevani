export interface Env {
  // Bindings
  DB: D1Database;
  SONG_BUCKET: R2Bucket;
  CACHE: KVNamespace;

  // Secrets & Configs
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  ENVIRONMENT: "development" | "production" | "staging";
}
