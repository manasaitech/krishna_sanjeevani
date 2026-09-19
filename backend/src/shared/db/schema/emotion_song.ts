// ─────────────────────────────────────────────────────────────
// Emotion Remediation — Emotion Songs Schema
// Authoritative schema for Emotion Remediation audio tracks,
// dosha alignments, emotional transition trajectories, and review state.
// Zero dependency on Surawali tables or models.
// ─────────────────────────────────────────────────────────────

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const ReviewStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  PUBLISHED: "published",
} as const;

export type ReviewStatusType = (typeof ReviewStatus)[keyof typeof ReviewStatus];

export const emotionSongs = sqliteTable("emotion_songs", {
  /** Stable primary key ID, e.g. "em_song_001" */
  id: text("id").primaryKey(),

  /** Song title as specified in the authoritative Google Sheet */
  title: text("title").notNull(),

  /** Emotional transition trajectory (e.g. "Kshobha --> Prashanti") */
  trajectory: text("trajectory").notNull(),

  /** Initial emotional state (e.g. "Kshobha", "Visada", "Utsaha") */
  initialState: text("initial_state").notNull(),

  /** Intermediate emotional state if 3-step transition (e.g. "Utsaha") or null */
  intermediateState: text("intermediate_state"),

  /** Target emotional state (e.g. "Prashanti", "Utsaha") */
  targetState: text("target_state").notNull(),

  /** Ayurvedic Dosha type: "kapha" | "pitta" | "vata" */
  dosha: text("dosha").notNull(),

  /** Original filename in the source ZIP archive */
  originalFilename: text("original_filename").notNull(),

  /** Dedicated R2 bucket name */
  r2Bucket: text("r2_bucket").notNull().default("krishna-sanjeevani-emotion-remediation"),

  /** Stable R2 object key: "songs/{id}/audio.mp3" */
  r2Key: text("r2_key").notNull(),

  /** SHA-256 hash of the audio file for integrity and duplicate detection */
  fileHash: text("file_hash").notNull(),

  /** File size in bytes */
  fileSize: integer("file_size").notNull(),

  /** Audio duration in seconds */
  duration: integer("duration").default(0),

  /** MIME type (e.g. "audio/mpeg") */
  mimeType: text("mime_type").default("audio/mpeg"),

  /** Review status: "pending" | "approved" | "rejected" | "published" */
  reviewStatus: text("review_status").notNull().default("pending"),

  /** Review notes by administrator */
  reviewNotes: text("review_notes"),

  /** Admin user ID who reviewed the song */
  reviewedBy: text("reviewed_by"),

  /** Timestamp of review */
  reviewedAt: integer("reviewed_at"),

  /** Reason if rejected */
  rejectionReason: text("rejection_reason"),

  /** Additional JSON metadata (artist, tags, audio quality, etc.) */
  metadata: text("metadata"),

  /** Creation timestamp */
  createdAt: integer("created_at").notNull(),

  /** Update timestamp */
  updatedAt: integer("updated_at").notNull(),
});

export type EmotionSong = typeof emotionSongs.$inferSelect;
export type NewEmotionSong = typeof emotionSongs.$inferInsert;
