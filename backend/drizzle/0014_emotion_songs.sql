-- D1 Database Migration: 0014_emotion_songs.sql
-- Creates the dedicated table for Emotion Remediation songs, doshas, trajectories, and review workflow.

CREATE TABLE IF NOT EXISTS `emotion_songs` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`trajectory` text NOT NULL,
	`initial_state` text NOT NULL,
	`intermediate_state` text,
	`target_state` text NOT NULL,
	`dosha` text NOT NULL,
	`original_filename` text NOT NULL,
	`r2_bucket` text DEFAULT 'krishna-sanjeevani-emotion-remediation' NOT NULL,
	`r2_key` text NOT NULL,
	`file_hash` text NOT NULL,
	`file_size` integer NOT NULL,
	`duration` integer DEFAULT 0,
	`mime_type` text DEFAULT 'audio/mpeg',
	`review_status` text DEFAULT 'pending' NOT NULL,
	`review_notes` text,
	`reviewed_by` text,
	`reviewed_at` integer,
	`rejection_reason` text,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

CREATE INDEX IF NOT EXISTS `idx_emotion_songs_dosha` ON `emotion_songs` (`dosha`);
CREATE INDEX IF NOT EXISTS `idx_emotion_songs_trajectory` ON `emotion_songs` (`trajectory`);
CREATE INDEX IF NOT EXISTS `idx_emotion_songs_review_status` ON `emotion_songs` (`review_status`);
