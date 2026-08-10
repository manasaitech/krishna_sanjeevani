-- Phase 5: Program Management System
-- Redesign programs and program_tracks tables

-- Step 1: Create new programs table with Phase 5 schema
CREATE TABLE `programs_new` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`subtitle` text,
	`description` text,
	`thumbnail_key` text,
	`category` text NOT NULL,
	`difficulty` text DEFAULT 'beginner' NOT NULL,
	`estimated_duration` integer,
	`language` text DEFAULT 'hi' NOT NULL,
	`tier` text DEFAULT 'free' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
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

-- Step 2: Copy existing programs data into the new table
INSERT INTO `programs_new` (`id`, `title`, `subtitle`, `description`, `thumbnail_key`, `category`, `difficulty`, `estimated_duration`, `language`, `tier`, `status`, `created_by`, `created_at`, `updated_at`)
SELECT `id`, `title`, `subtitle`, `description`, `art`, `category`, 'beginner', NULL, 'hi',
  CASE WHEN `premium` = 1 THEN 'premium' ELSE 'free' END,
  'draft', 'system', `created_at`, `updated_at`
FROM `programs`;
--> statement-breakpoint

-- Step 3: Drop old programs table
DROP TABLE `programs`;
--> statement-breakpoint

-- Step 4: Rename new table
ALTER TABLE `programs_new` RENAME TO `programs`;
--> statement-breakpoint

-- Step 5: Create new program_tracks table with composite PK and is_required field
CREATE TABLE `program_tracks_new` (
	`program_id` text NOT NULL,
	`track_id` text NOT NULL,
	`sequence` integer NOT NULL,
	`is_required` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`program_id`, `track_id`),
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- Step 6: Copy existing program_tracks data
INSERT INTO `program_tracks_new` (`program_id`, `track_id`, `sequence`, `is_required`, `created_at`)
SELECT `program_id`, `track_id`, `sequence`, 1, `created_at`
FROM `program_tracks`;
--> statement-breakpoint

-- Step 7: Drop old program_tracks table
DROP TABLE `program_tracks`;
--> statement-breakpoint

-- Step 8: Rename new table
ALTER TABLE `program_tracks_new` RENAME TO `program_tracks`;
