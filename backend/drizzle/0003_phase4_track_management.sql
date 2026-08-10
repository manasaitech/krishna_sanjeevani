-- Phase 4: Track Management System
-- Redesign tracks table and add tags/track_tags tables

-- Step 1: Create new tracks table with Phase 4 schema
CREATE TABLE `tracks_new` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`subtitle` text,
	`description` text,
	`artist` text NOT NULL,
	`duration` integer,
	`category` text NOT NULL,
	`language` text DEFAULT 'hi' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`tier` text DEFAULT 'free' NOT NULL,
	`playlist_key` text,
	`thumbnail_key` text,
	`processing_status` text DEFAULT 'uploaded' NOT NULL,
	`publish_status` text DEFAULT 'draft' NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text,
	`deleted_at` integer,
	`deleted_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

-- Step 2: Drop old tracks table (cascade will also drop stream_sessions FK references)
-- Note: SQLite does not enforce FK constraints on DROP TABLE by default.
-- stream_sessions references tracks(id) but we recreate the tracks table with same PKs.
DROP TABLE `tracks`;
--> statement-breakpoint

-- Step 3: Rename new table
ALTER TABLE `tracks_new` RENAME TO `tracks`;
--> statement-breakpoint

-- Step 4: Create tags table
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_unique` ON `tags` (`slug`);
--> statement-breakpoint

-- Step 5: Create track_tags junction table
CREATE TABLE `track_tags` (
	`track_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`track_id`, `tag_id`),
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
